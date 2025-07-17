// archivo: pages/api/gemini.js
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

//
// Función de retry exponencial para llamadas a Gemini
//
async function generateWithRetry(model, prompt, maxRetries = 2) {
  let delay = 500; // ms
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return (await result.response).text();
    } catch (e) {
      // si es un 503 de Gemini, reintenta
      if (e.status === 503 && i < maxRetries) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      throw e;
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const {
      selectedModules,
      customerName,
      customerCompany,
      licenseQuote,
      quote,
      hosteo,
      estimatedHours,
    } = req.body;

    const deliveryDays = Math.ceil(estimatedHours / 8);
    const today = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

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

Genera el contenido en español sin faltas de ortografia, siguiendo exactamente esas diez secciones y nada más.
`;

    // 6) Inicializamos Gemini y pedimos la generación con retry
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      // puedes ajustar maxOutputTokens para respuestas más breves:
      maxOutputTokens: 800,
    });
    const text = await generateWithRetry(model, prompt);

    // quitar dobles asteriscos y poner asteriscos simples
    let processedText = text.replace(/\*\*/g, "");
    processedText = processedText.replace(/\*/g, "•");

    // 7) Creamos el PDF con jsPDF
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginX = 60;
    const marginY = 60;
    const usableWidth = pageWidth - marginX * 2;
    const lineHeight = 18;
    let y;

    // 7b) Insertar encabezado e imagen
    try {
      const headerPath = path.join(
        process.cwd(),
        "public",
        "Encabezado-Odoo.jpg"
      );
      const headerBuffer = fs.readFileSync(headerPath);
      const headerBase64 = headerBuffer.toString("base64");
      const headerProps = doc.getImageProperties(
        `data:image/jpeg;base64,${headerBase64}`
      );
      const headerHeight = (headerProps.height * pageWidth) / headerProps.width;
      doc.addImage(
        `data:image/jpeg;base64,${headerBase64}`,
        "JPEG",
        0,
        0,
        pageWidth,
        headerHeight
      );
      y = headerHeight + 10;

      const fotoPath = path.join(process.cwd(), "public", "foto-email.jpeg");
      const fotoBuffer = fs.readFileSync(fotoPath);
      const fotoBase64 = fotoBuffer.toString("base64");
      const fotoProps = doc.getImageProperties(
        `data:image/jpeg;base64,${fotoBase64}`
      );
      const fotoHeight = (fotoProps.height * pageWidth) / fotoProps.width;
      doc.addImage(
        `data:image/jpeg;base64,${fotoBase64}`,
        "JPEG",
        0,
        y,
        pageWidth,
        fotoHeight
      );
      y += fotoHeight + marginY;
    } catch (err) {
      console.error("Error cargando imágenes:", err);
      y = marginY;
    }

    // 8) Escribir texto con saltos y justificado
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
        doc.setFont("helvetica", /^\d+\.\s/.test(chunk) ? "bold" : "normal");
        doc.text(chunk, marginX, y, {
          maxWidth: usableWidth,
          align: "justify",
        });
        y += lineHeight;
      }
    }

    // 9) Sección de firma
    if (y > pageHeight - marginY - 5 * lineHeight) {
      doc.addPage();
      y = marginY;
    }
    y += lineHeight * 4;
    doc.setFont("helvetica", "bold");
    doc.text("Aceptación de la propuesta", pageWidth / 2, y, {
      align: "center",
    });
    y += lineHeight * 2;
    doc.setFont("helvetica", "normal");
    doc.text("______________________________", pageWidth / 2, y, {
      align: "center",
    });
    y += lineHeight * 1.2;
    doc.text(`Nombre: ${customerName}`, pageWidth / 2, y, { align: "center" });
    y += lineHeight;
    doc.text(`Empresa: ${customerCompany}`, pageWidth / 2, {
      align: "center",
    });
    y += lineHeight * 2;

    const pdfArray = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Propuesta de Odoo para ${customerCompany}.pdf"`
    );
    res.send(Buffer.from(pdfArray));
  } catch (error) {
    console.error("Error en /api/gemini:", error);
    res.status(500).json({ error: "No se pudo generar la propuesta" });
  }
}
