# Cotizador Tersoft

Cotizador en línea de proyectos Odoo. El prospecto arma su configuración
(módulos, licencias, tipo de implementación), obtiene una estimación de horas y
costos, y descarga una propuesta en PDF redactada con IA. Cada cotización queda
registrada como lead en Google Sheets.

Producción: rama `main` — se despliega solo en Vercel al hacer push.

## Stack

| Pieza | Tecnología |
|---|---|
| Framework | Next.js 15 (Pages Router, JavaScript) |
| UI | MUI v7 + SweetAlert2 |
| Autenticación | NextAuth con proveedor Google (sesión JWT) |
| Redacción de propuestas | Google Gemini (`gemini-2.5-flash`) |
| Generación de PDF | jsPDF (en el servidor) |
| Registro de leads | Google Sheets vía cuenta de servicio |
| Correo | Nodemailer sobre Gmail SMTP |

## Puesta en marcha

```bash
npm install
cp .env.example .env    # y llena los valores — ver comentarios del archivo
npm run dev             # http://localhost:3000
```

Para que el login con Google funcione en local, agrega
`http://localhost:3000/api/auth/callback/google` a las URIs de redirección
autorizadas de la credencial OAuth en Google Cloud Console.

```bash
npm run build   # build de producción
npm start       # sirve el build
npm run lint
```

## Estructura

```
src/pages/
  index.js                      redirige a /login
  login.js                      landing pública + acceso (Google o invitado)
  cotizador.js                  formulario, cálculo y descarga del PDF
  diagnostico-inteligente.js    diagnóstico asistido por IA (fuera del menú)
  api/
    auth/[...nextauth].js       NextAuth (Google)
    cotizacion/iniciar.js       registra el lead en Google Sheets
    cotizacion/procesar.js      Gemini → PDF → descarga (+ correo best-effort)
    gemini-diagnostico.js       PDF del diagnóstico inteligente
src/components/                 Layout, Navbar y Footer (no aplican en /login)
public/                         logos, imágenes del hero y del encabezado del PDF
```

## Cómo fluye una cotización

1. `/cotizador` calcula horas y costos en el navegador conforme cambia el formulario.
2. Al pedir la propuesta se llaman dos endpoints en paralelo:
   - `POST /api/cotizacion/iniciar` — guarda el lead en Sheets.
   - `POST /api/cotizacion/procesar` — pide el texto a Gemini, arma el PDF y lo devuelve.
3. El navegador descarga el PDF directamente de la respuesta.
4. El correo se intenta enviar dentro de `procesar`, pero **no bloquea**: si las
   credenciales SMTP fallan, se registra el error y la descarga ocurre igual.

## Reglas de negocio a tener presentes

- **IVA 16% solo sobre licencias.** La implementación se factura con IVA por
  separado (Tersoft), por eso no se le suma en el total de licencias.
- **Tipo de cambio** configurable con `NEXT_PUBLIC_EXCHANGE_RATE_MXN_USD`
  (default 19). No se consulta ningún servicio de tipo de cambio.
- **Costo de implementación** = horas estimadas × 500 MXN, +1000 si el cliente
  no tiene catálogo de cuentas.
- Los endpoints son **públicos**: existe acceso como invitado, así que no
  requieren sesión. Tenlo en cuenta si algún día se agrega rate limiting.

## Variables de entorno

Están todas documentadas en [`.env.example`](.env.example), incluida la fuente
de cada credencial. Las mismas se cargan en Vercel → Project Settings →
Environment Variables.

Dos que suelen dar problemas al cambiar de entorno:

- `GOOGLE_PRIVATE_KEY` debe ir en una sola línea, entrecomillada y con los
  saltos como `\n` literales. El código los reconvierte.
- `NEXTAUTH_URL` debe coincidir exactamente con el dominio real, y ese dominio
  debe estar dado de alta como URI de redirección en Google Cloud Console.

## Deuda técnica conocida

- Sin tests automatizados.
- 10 vulnerabilidades de npm pendientes; todas requieren upgrades mayores
  (`jspdf` 3→4, `next` 15→16, `nodemailer` 7→9, `googleapis` 149→174,
  `next-auth` 4→5). Ver `npm audit`.
- En `cotizador.js` quedan campos capturados que no afectan el cálculo
  (`operaciones`, `fechaInicio`, `multimoneda`) y lógica inactiva de
  `Odoo.sh`, `urgenciaDias` y `personalizaciones`, cuyos controles están
  comentados en la interfaz.
- El panel de Resumen fijo se posiciona con un `left` calculado a mano que
  asume un contenedor de 1200 px.
