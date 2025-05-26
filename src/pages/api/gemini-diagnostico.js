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
  // 1) Solo aceptamos POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // 2) Extraemos todos los datos que envía el frontend
    const {
      customerName,
      customerCompany,
      customerEmail,
      customerPhone,
      sectorIndustria,
      tamanoOrganizacion,
      procesosCriticos,
      herramientasActuales,
      modulosPrioritarios,
      volumenUsuarios,
      preferenciaHosting,
      disponibilidadRendimiento,
      integracionesExternas,
      migracionDatos,
      personalizaciones,
      soporteCapacidad,
    } = req.body;

    // 3) Calculamos la fecha de hoy en español
    const today = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // 4) Construimos el prompt para Gemini
    const prompt = `DIAGNÓSTICO INTELIGENTE PARA ${customerCompany}

Cliente: ${customerName}
Empresa: ${customerCompany}
Correo: ${customerEmail}
Teléfono: ${customerPhone}
Fecha: ${today}

Instrucciones: Genera un diagnóstico profesional y personalizado para la implementación de Odoo en la empresa, usando la información proporcionada. Estructura la respuesta en las siguientes secciones numeradas, con redacción clara y profesional, y sin agregar nada fuera de estas secciones:

1. Resumen ejecutivo
- Breve descripción del contexto y necesidades de la empresa.

2. Tipo de hosteo recomendado
- Analiza la preferencia del cliente (${preferenciaHosting}) y recomienda el tipo de hosteo más adecuado (Odoo.sh, nube pública, on-premise), justificando la elección.

3. Módulos de Odoo recomendados
- Lista y describe los módulos de Odoo que mejor se adaptan a la empresa, usando la información de procesos críticos (${procesosCriticos}), herramientas actuales (${herramientasActuales}) y módulos prioritarios (${modulosPrioritarios}).

4. Personalizaciones y desarrollos sugeridos
- Sugiere personalizaciones, automatizaciones o reportes a medida relevantes para la empresa, usando la información de personalizaciones (${personalizaciones}) y retos mencionados.

5. Volumen de usuarios y roles
- Resume la cantidad de usuarios y perfiles requeridos (${volumenUsuarios}).

6. Integraciones externas
- Recomienda integraciones con sistemas externos relevantes (${integracionesExternas}).

7. Migración de datos
- Explica el alcance y recomendaciones para la migración de datos históricos (${migracionDatos}).

8. Soporte y acompañamiento
- Explica que TERSOFT realizará una implementación completa, acompañando al cliente en todas las fases, y que se recomienda soporte externo profesional tras el lanzamiento, aunque se cuente con equipo interno (${soporteCapacidad}).

9. Siguiente paso sugerido
- Invita al cliente a agendar una reunión de consultoría gratuita para definir el alcance final y resolver dudas.

Redacta en español, con tono profesional y orientado a la acción. No agregues información fuera de estas secciones.`;

    // 5) Llamada a Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    // quitar dobles asteriscos y poner asteriscos simples
    let processedText = text.replace(/\*\*/g, "");
    processedText = processedText.replace(/\*/g, "•");

    // 6) Creamos el PDF con jsPDF
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Márgenes y configuración base
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginX = 60;
    const marginY = 60;
    const usableWidth = pageWidth - marginX * 2;
    const lineHeight = 18;
    let y;

    // Encabezado visual
    try {
      const headerPath = path.join(process.cwd(), "public", "Encabezado-Odoo.jpg");
      const headerBuffer = fs.readFileSync(headerPath);
      const headerBase64 = headerBuffer.toString("base64");
      const imgProps = doc.getImageProperties(`data:image/jpeg;base64,${headerBase64}`);
      const headerHeight = (imgProps.height * pageWidth) / imgProps.width;
      doc.addImage(`data:image/jpeg;base64,${headerBase64}`, "JPEG", 0, 0, pageWidth, headerHeight);
      const spacingAfterHeader = 10;
      y = headerHeight + spacingAfterHeader;
    } catch (err) {
      console.error("Error cargando encabezado desde disco:", err);
      y = marginY;
    }

    // Escribimos cada línea, aplicando negritas en títulos y justificando texto
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
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(chunk, marginX, y, {
          maxWidth: usableWidth,
          align: "justify",
        });
        y += lineHeight;
      }
    }

    // Devolvemos el PDF al navegador
    const pdfArray = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfArray));
  } catch (error) {
    console.error("Error en /api/gemini-diagnostico:", error);
    res.status(500).json({ error: "No se pudo generar el diagnóstico" });
  }
}
