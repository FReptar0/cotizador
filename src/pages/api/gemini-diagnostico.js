// archivo: pages/api/gemini-diagnostico.js
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Función auxiliar para texto con **negritas**
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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // 1) Datos del frontend
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

    // 2) Fecha actual
    const today = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // 3) Prompt para Gemini
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

    // 4) Generación con Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    // 5) Crear PDF con jsPDF
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    // — Metadatos PDF
    doc.setProperties({
      title: "Diagnóstico Inteligente Odoo",
      author: "TERSOFT",
    });

    // — Constantes de diseño
    const primaryColor = "#005f8d";
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginX = 50;
    const marginY = 60;
    const usableWidth = pageWidth - marginX * 2;
    const lineHeight = 20;
    let y = marginY;

    // — Encabezado original con imagen (si existe)
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
      // Si no encuentra la imagen, usar margen por defecto
      y = marginY;
    }

    // — Cuerpo del documento
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor("#333333");

    const lines = text.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        y += lineHeight;
        continue;
      }

      // Títulos de sección (número al inicio)
      const isSectionTitle = /^\d+\./.test(line);
      if (isSectionTitle) {
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(primaryColor);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor("#333333");
      }

      const wrapped = doc.splitTextToSize(line, usableWidth);
      for (const chunk of wrapped) {
        if (y > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        // Negritas inline
        if (/\*\*[^*]+\*\*/.test(chunk)) {
          renderLineWithBold(doc, chunk, marginX, y);
        } else {
          doc.text(chunk, marginX, y, {
            maxWidth: usableWidth,
            align: "justify",
          });
        }
        y += lineHeight;
      }
    }

    // — Separador antes del pie
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(
      marginX,
      pageHeight - marginY + 10,
      pageWidth - marginX,
      pageHeight - marginY + 10
    );

    // — Pie de página con mensaje y numeración
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#555555");
      doc.text(
        "Diagnóstico preliminar • Para propuesta formal, agenda en calendly.com/tersoft",
        marginX,
        pageHeight - marginY + 30,
        { maxWidth: usableWidth }
      );
      doc.text(
        `Página ${i} / ${totalPages}`,
        pageWidth - marginX,
        pageHeight - marginY + 30,
        { align: "right" }
      );
    }

    // — Envío del PDF
    const pdfArray = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfArray));
  } catch (error) {
    console.error("Error en /api/gemini-diagnostico:", error);
    res.status(500).json({ error: "No se pudo generar la propuesta" });
  }
}
