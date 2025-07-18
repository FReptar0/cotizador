// archivo: pages/api/gemini.js
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
// Cambio: utilizamos fetch en Node.js para cargar imágenes desde /public
// (en Next.js 13+ fetch es global; si usas versión anterior, instala node-fetch)

//
// Función auxiliar: dibuja cada línea detectando **texto** y poniéndolo en negrita
//
function renderLineWithBold(doc, line, marginX, posY) {
  let x = marginX;
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  fjp;
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      const text = part.slice(2, -2);
      doc.setFont("helvetica", "bold");
      doc.text(text, x, posY);
      x += doc.getTextWidth(text);
    } else {
      doc.setFont("helvetica", "normal");
      doc.text(part, x, posY);
      x += doc.getTextWidth(part);
    }
  }
}

export default async function handler(req, res) {
  console.log("➡️ NODE_ENV:", process.env.NODE_ENV);
  console.log("🔑 GEMINI_API_KEY:", process.env.GEMINI_API_KEY);

  // 1) Solo aceptamos POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // 2) Extraemos todos los datos que envía el frontend
    const {
      selectedModules,
      customerName,
      customerCompany,
      licenseQuote,
      quote,
      hosteo,
      estimatedHours,
      // ... (otros campos que ya no se usan en la propuesta)
    } = req.body;

    // 3) Calcular días de entrega
    const deliveryDays = Math.ceil(estimatedHours / 8);

    // 4) Calculamos la fecha de hoy en español
    const today = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // 5) Construimos el prompt que enviamos a Gemini
    const plantilla = `PROPUESTA DE IMPLEMENTACIÓN DE ODOO PARA ${customerCompany}`;
    const prompt = `${plantilla}



Instrucciones: genera únicamente las siguientes secciones numeradas del 1 al 10, sin agregar nada más:

Cliente: ${customerName}
Empresa: ${customerCompany}
Fecha: ${today}

1. Introducción
    - Breve descripción del proyecto y su importancia.
    - Escribir " Esta propuesta tiene como objetivo la implementación del sistema ERP Odoo en la empresa ${customerCompany} para optimizar sus procesos y mejorar su eficiencia operativa. El sistema Odoo es una solución integral que permite gestionar diversas áreas de la empresa, ${selectedModules}, todo en una única plataforma. La implementación de Odoo permitirá a ${customerCompany} automatizar tareas, reducir costos y mejorar la toma de decisiones mediante el acceso a información en tiempo real."

2. Procesos Actuales Identificados
    - listar los procesos actuales que se están utilizando en la empresa.
    - Escribir "Los procesos actuales de ${customerCompany} incluyen la gestión manual de ${selectedModules}, lo que ha llevado a ineficiencias y errores. La falta de integración entre departamentos ha dificultado la colaboración y el flujo de información, lo que ha resultado en retrasos y costos adicionales."
3. Objetivos del Proyecto
    - Describir los objetivos específicos que se buscan alcanzar con la implementación de Odoo.
    - Escribir "Los objetivos del proyecto son: (como ejemplo toma, centraliar la informacione n una sola plataforma ...,"
4. Alcance del Proyecto
    - escribir "El alcance del proyecto inclutye los siguientes modulos de odoo:"
    - Listar los módulos de Odoo que se implementarán ${selectedModules} siempre describir su funcionalidad especificamente para esa empresa.
    - Escribir "El alcance del proyecto incluye la implementación de los siguientes módulos de Odoo:
    
5. Fuera del Alcance
    - Escribir "En esta fase del proyecto no se implementará ningun módulo que no se incluya en la cotización"
6. Entregables del Proyecto
    - Escribir Los entregables incluirán: 
    • Documentación de requisitos con detalles de configuración y personalización.
    • Configuración de módulos según necesidades específicas.
    • Personalización avanzada en ${hosteo}
    • Manuales de usuario para facilitar la adopción del sistema.
    • Capacitaciones a los usuarios clave.
    • Reportes y dashboards personalizados segun se requieran.
    • Soporte post-implementación durante la fase inicia
7. Método de Implementación
   - Escribir "Fases del Proyecto:
    1. Análisis de Requisitos
    • Revisión detallada de procesos actuales.
    • Definición de necesidades específicas.
    • Priorización de funcionalidades clave.
    2. Planificación del Proyecto
    • Creación del cronograma.
    • Asignación de roles y responsables.
    3. Configuración y Personalización de Odoo
    • Ajustes en los módulos estándar.
    • Desarrollo de personalizaciones en Odoo.sh.
    4. Capacitación de Usuarios
    • Sesiones teórico-prácticas.
    • Material de apoyo y documentación.
    5. Pruebas y Ajustes
    • Pruebas funcionales con usuarios clave.
    • Validación del cumplimiento de requerimientos.
    6. Puesta en Marcha
    • Implementación en vivo.
    • Asistencia técnica inicial.
    7. Soporte y Evaluación
    • Resolución de incidencias.
    • Optimización continua del sistema."
8. Costos y Condiciones de Pago

    - Escribir "Los costos del proyecto son los siguientes:
    - Costo de licencias: MX$ ${licenseQuote} (directamente con Odoo)
    - Implementación: MX$ ${quote} + IVA (con tersoft)
    - Condiciones de pago: 100% al finalizar la implementación.
9. Conclusión
   -  escribir "La implementacion de odoo proporcionara a ${customerCompany} una plataforma integrada y eficiente para gestionar sus operaciones. Con la implementación de Odoo, ${customerCompany} podrá optimizar sus procesos, mejorar la colaboración entre departamentos y tomar decisiones informadas basadas en datos en tiempo real. Estamos comprometidos a brindar un servicio de alta calidad y a garantizar el éxito de esta implementación."

10. Beneficios adicionales
    • Sin anticipo para la consultoria, usted va a pagar hasta que su proyecto este funcionando correctamente
    • 15 dias de soporte post-implementación
    • TERSOFT esta compormetido con el exito del proyecto y garantizara una implementacion efectiva, con soporte continuo y adaptacion a las necesidades especificas de ${customerCompany}
    • A la espera de su aprobacion para proceder con la implementacion de Odoo en su empresa.

  ATENTAMENTE
  TERSOFT
    
Datos para la sección 8:
- Costo de licencias: MX$ ${licenseQuote} (directamente con Odoo)
- Implementación: MX$ ${quote} + IVA (con tersoft)

Genera el contenido en español sin faltas de ortografia, siguiendo exactamente esas nueve secciones y nada más.
`;

    // 6) Inicializamos Gemini y pedimos la generación
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    // quitar dobles asteriscos y poner asteriscos simples
    let processedText = text.replace(/\*\*/g, "");
    processedText = processedText.replace(/\*/g, "•");

    // 7) Creamos el PDF con jsPDF
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Márgenes y configuración base
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginX = 60; // margen izquierdo y derecho
    const marginY = 60; // margen superior y fondo
    const usableWidth = pageWidth - marginX * 2;
    const lineHeight = 18;
    let y;

    // 7b) Insertar encabezado a 100% de ancho, sin márgenes superiores
    try {
      const headerPath = path.join(
        process.cwd(),
        "public",
        "Encabezado-Odoo.jpg"
      );
      const headerBuffer = fs.readFileSync(headerPath);
      const headerBase64 = headerBuffer.toString("base64");
      const imgProps = doc.getImageProperties(
        `data:image/jpeg;base64,${headerBase64}`
      );
      const headerHeight = (imgProps.height * pageWidth) / imgProps.width;
      doc.addImage(
        `data:image/jpeg;base64,${headerBase64}`,
        "JPEG",
        0,
        0,
        pageWidth,
        headerHeight
      );
      // desplazamos Y tras el encabezado
      const spacingAfterHeader = 10;
      y = headerHeight + spacingAfterHeader;
    } catch (err) {
      console.error("Error cargando encabezados desde disco:", err);
      y = marginY;
    }

    // 8) Escribimos cada línea, aplicando negritas en títulos y justificando texto
    const lines = processedText.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        y += lineHeight;
        continue;
      }
      const wrapped = doc.splitTextToSize(line, usableWidth);
      for (const chunk of wrapped) {
        if (y > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        if (/^\d+\.\s/.test(chunk)) {
          // títulos en negrita y justificados
          doc.setFont("helvetica", "bold");
        } else {
          // texto normal
          doc.setFont("helvetica", "normal");
        }
        doc.text(chunk, marginX, y, {
          maxWidth: usableWidth,
          align: "justify",
        });
        y += lineHeight;
      }
    }

    // 9) Devolvemos el PDF al navegador

    // --- NUEVO BLOQUE: Sección de aceptación centrada con línea para firma ---
    if (y > pageHeight - marginY - 5 * lineHeight) {
      doc.addPage();
      y = marginY;
    }
    // Doble espacio antes de la línea de firma
    y += lineHeight * 4;
    doc.setFont("helvetica", "bold");
    doc.text("Aceptación de la propuesta", pageWidth / 2, y, {
      align: "center",
    });
    y += lineHeight * 2;
    doc.setFont("helvetica", "normal");
    // Línea para firma
    doc.text("______________________________", pageWidth / 2, y, {
      align: "center",
    });
    y += lineHeight * 1.2;
    // Nombre y empresa centrados debajo de la línea
    doc.text(`Nombre: ${customerName}`, pageWidth / 2, y, { align: "center" });
    y += lineHeight;
    doc.text(`Empresa: ${customerCompany}`, pageWidth / 2, y, {
      align: "center",
    });
    y += lineHeight * 2;

    const pdfArray = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=\"Propuesta de Odoo para ${customerCompany}.pdf\"`
    );
    res.send(Buffer.from(pdfArray));
  } catch (error) {
    console.error("Error en /api/gemini:", error);
    res.status(500).json({ error: "No se pudo generar la propuesta" });
  }
}
