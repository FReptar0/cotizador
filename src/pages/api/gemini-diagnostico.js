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
      nombreCliente,
      nombreEmpresa,
      email,
      telefono,
      giro,
      empleados,
      procesos,
      problemas,
      objetivos,
      clientes,
      productos,
      ventas,
      logistica,
      equipoTI,
    } = req.body;

    // 3) Fecha actual
    const today = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // 4) Construimos el prompt para Gemini
    const prompt = `DIAGNÓSTICO INTELIGENTE DE IMPLEMENTACIÓN ODOO
Cliente: ${nombreCliente}
Empresa: ${nombreEmpresa}
Correo: ${email}
Teléfono: ${telefono}
Fecha: ${today}

Genera un diagnóstico profesional y personalizado para la empresa con la siguiente estructura (en español, redactado de forma clara y ejecutiva):

1. Datos del cliente
- Nombre: ${nombreCliente}
- Empresa: ${nombreEmpresa}
- Correo: ${email}
- Teléfono: ${telefono}
- Sector/Industria: ${giro}
- Tamaño: ${empleados}

2. Procesos actuales y retos
${procesos}

3. Herramientas actuales
${problemas}

4. Objetivos y módulos recomendados
${objetivos}

5. Módulos de Odoo recomendados (describe por qué cada uno es útil para la empresa)
${objetivos}

6. Cómo Odoo mejorará los procesos y hará más eficiente la empresa
(Explica cómo Odoo resuelve los retos y mejora los procesos descritos)

7. Ventajas de Odoo frente a otras soluciones
(Lista ventajas concretas de Odoo para este tipo de empresa)

8. Ventajas de implementar Odoo con TERSOFT
(Lista ventajas y diferenciales de trabajar con TERSOFT para la implementación)

9. Siguiente paso sugerido
(Invita a agendar una reunión para una consultoría personalizada)

Redacta cada sección con subtítulo y texto claro, usando viñetas donde sea útil. No inventes datos de contacto. No repitas información. No agregues secciones extra. No uses lenguaje genérico, personaliza según los datos recibidos.`;

    // 5) Inicializamos Gemini y pedimos la generación
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

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
    let y = marginY;

    // Encabezado (opcional: puedes agregar logo aquí)
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
      y = headerHeight + 10;
    } catch (err) {
      y = marginY;
    }

    // Escribimos cada línea, aplicando negritas en títulos
    const lines = text.split("\n");
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
        if (/^\d+\./.test(chunk) || /^- /.test(chunk)) {
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

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const footerText =
      "Este diagnóstico es preliminar. Para una propuesta formal, agenda una consultoría personalizada en https://calendly.com/tersoft/primera-sesion-para-conocer-necesidades-de-su-empresa";
    const footerLines = doc.splitTextToSize(footerText, usableWidth);
    doc.text(footerLines, marginX, pageHeight - marginY + 20);

    // 7) Devolvemos el PDF al navegador
    const pdfArray = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfArray));
  } catch (error) {
    console.error("Error en /api/gemini:", error);
    res.status(500).json({ error: "No se pudo generar la propuesta" });
  }
}
