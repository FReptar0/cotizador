// pages/api/cotizacion/procesar.js
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";

export const config = {
  maxDuration: 60, // 60 segundos en plan Pro, 10 en Free
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST permitido" });
  }

  const {
    cotizacionId,
    customerName,
    customerCompany,
    customerEmail,
    selectedModules,
    licenseQuote,
    quote,
    hosteo,
    estimatedHours,
    tipoMoneda = "MXN",
    exchangeRate = 19,
  } = req.body;

  try {
    console.log(`⏳ Procesando cotización ${cotizacionId}`);

    // PASO 1: GENERAR CONTENIDO CON GEMINI
    const deliveryDays = Math.ceil(estimatedHours / 8);

    const convertPrice = (mxnPrice) => {
      if (tipoMoneda === "USD") {
        return mxnPrice / exchangeRate;
      }
      return mxnPrice;
    };

    const getCurrencySymbol = () => {
      return tipoMoneda === "USD" ? "USD $" : "MX$";
    };

    const formatPrice = (value) => {
      const number = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(number)) return "0.00";
      return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const convertedLicenseQuote = convertPrice(parseFloat(licenseQuote || 0));
    const convertedImplementationQuote = convertPrice(parseFloat(quote || 0));
    const currencySymbol = getCurrencySymbol();

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
    - Costo de licencias: ${currencySymbol} ${formatPrice(
      convertedLicenseQuote
    )} (directamente con Odoo)
    - Implementación: ${currencySymbol} ${formatPrice(
      convertedImplementationQuote
    )} + IVA (con tersoft)${
      tipoMoneda === "USD"
        ? `
    - Tipo de cambio utilizado: ${exchangeRate} MXN = 1 USD`
        : ""
    }
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
- Costo de licencias: ${currencySymbol} ${formatPrice(
      convertedLicenseQuote
    )} (directamente con Odoo)
- Implementación: ${currencySymbol} ${formatPrice(
      convertedImplementationQuote
    )} + IVA (con tersoft)

Genera el contenido en español sin faltas de ortografia, siguiendo exactamente esas nueve secciones y nada más.
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    let processedText = text.replace(/\*\*/g, "");
    processedText = processedText.replace(/\*/g, "•");

    console.log(`✅ Contenido generado para ${cotizacionId}`);

    // PASO 2: GENERAR PDF
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
      const spacingAfterHeader = 10;
      y = headerHeight + spacingAfterHeader;
    } catch (err) {
      console.error("Error cargando encabezado:", err);
      y = marginY;
    }

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
    doc.text(`Empresa: ${customerCompany}`, pageWidth / 2, y, {
      align: "center",
    });

    const pdfBase64 = doc.output("datauristring").split(",")[1];
    console.log(`✅ PDF generado para ${cotizacionId}`);

    // PASO 3: ENVIAR EMAIL
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Tersoft Cotización" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: "Tu propuesta de implementación de Odoo | Tersoft",
      text: `Hola ${customerName}, adjunto tu propuesta de Odoo.`,
      html: `
    <div style="font-family:Arial,sans-serif; color:#333; line-height:1.5; max-width:600px; margin:0 auto;">
      <img src="cid:headerImg" alt="Tersoft" style="width:100%; max-width:600px; display:block; margin-bottom:1em;"/>
      <h2 style="color:#337ab7; margin-bottom:0.5em;">¡Hola ${customerName}!</h2>
      <p>En <a href="https://tersoft.mx" style="color:#337ab7; text-decoration:none;">Tersoft</a> queremos agradecerte por confiar en nosotros para tu proyecto de implementación de Odoo.</p>
      <p style="background:#f0f4f8; padding:1em; border-radius:5px;">
        Adjuntamos tu propuesta detallada en formato PDF. En ella encontrarás:
        <ul style="margin:0.5em 0 0 1.2em;">
          <li>Alcance de módulos y funcionalidades</li>
          <li>Estimación de horas y costo de implementación</li>
          <li>Plan de trabajo, entregables y condiciones de pago</li>
        </ul>
      </p>
      <p style="margin-top:1.5em;">
        Si tienes dudas sobre la propuesta, necesitas una demo o quieres contarnos más sobre tus necesidades, 
        <strong>programa una sesión gratuita</strong> con nuestro equipo:
      </p>
      <div style="text-align:center; margin:1.5em 0;">
        <a href="https://calendly.com/tersoft/primera-sesion-para-conocer-necesidades-de-su-empresa" target="_blank"
          style="display:inline-block;background-color:#337ab7;color:#fff;text-decoration:none;padding:12px 24px;border-radius:4px;font-weight:bold;">
          Agendar reunión
        </a>
      </div>
      <p>Estamos a tu disposición para llevar tu empresa al siguiente nivel con Odoo.</p>
      <p>Un saludo,<br/><strong>Equipo Tersoft</strong><br/><a href="https://tersoft.mx" style="color:#337ab7; text-decoration:none;">tersoft.mx</a></p>
      <hr style="border:none; border-top:1px solid #eee; margin:2em 0 1em;"/>
      <small style="color:#999;">Este correo fue enviado por Tersoft Cotizador.<br/></small>
    </div>
      `,
      attachments: [
        {
          filename: "Propuesta-Odoo.pdf",
          content: Buffer.from(pdfBase64, "base64"),
          contentType: "application/pdf",
        },
        {
          filename: "foto-email.png",
          path: path.join(process.cwd(), "public", "foto-email.jpeg"),
          cid: "headerImg",
        },
      ],
    });

    console.log(`✅ Email enviado para ${cotizacionId}`);

    return res.status(200).json({
      ok: true,
      cotizacionId,
      message: "Cotización procesada y enviada",
    });
  } catch (error) {
    console.error(`❌ Error procesando ${cotizacionId}:`, error);
    return res.status(500).json({
      error: "Error procesando cotización",
      details: error.message,
    });
  }
}
