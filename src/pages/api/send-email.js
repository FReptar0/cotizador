// pages/api/send-email.js
import nodemailer from "nodemailer";
import path from "path";

export default async function handler(req, res) {
  console.log("📬 /api/send-email llamada");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST permitido" });
  }

  const { customerEmail, customerName, customerCompany, pdfBase64 } = req.body;
  if (!customerEmail || !pdfBase64) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 2) Verifica la conexión
  try {
    await transporter.verify();
    console.log("✅ SMTP conectado");
  } catch (err) {
    console.error("❌ Error SMTP verify:", err);
    return res.status(500).json({ error: "Error conectando a SMTP" });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Tersoft Cotización" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      //bcc: "alberto.hernandez@tersoft.mx",
      subject: "Tu propuesta de implementación de Odoo | Tersoft",
      text: `Hola ${customerName}, adjunto tu propuesta de Odoo.`,
      html: `
    <div style="font-family:Arial,sans-serif; color:#333; line-height:1.5; max-width:600px; margin:0 auto;">


      <img 
        src="cid:headerImg" 
        alt="Tersoft" 
        style="width:100%; max-width:600px; display:block; margin-bottom:1em;"
      />

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
        <a 
          href="https://calendly.com/tersoft/primera-sesion-para-conocer-necesidades-de-su-empresa" 
          target="_blank"
          style="
            display:inline-block;
            background-color:#337ab7;
            color:#fff;
            text-decoration:none;
            padding:12px 24px;
            border-radius:4px;
            font-weight:bold;
          "
        >
          Agendar reunión
        </a>
      </div>
      
      <p>Estamos a tu disposición para llevar tu empresa al siguiente nivel con Odoo.</p>
      
      <p>Un saludo,<br/>
      <strong>Equipo Tersoft</strong><br/>
      <a href="https://tersoft.mx" style="color:#337ab7; text-decoration:none;">tersoft.mx</a>
      </p>
      
      <hr style="border:none; border-top:1px solid #eee; margin:2em 0 1em;"/>
      <small style="color:#999;">
        Este correo fue enviado por Tersoft Cotizador.<br/>
      </small>
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
          cid: "headerImg", // Referencia para la imagen en el HTML
        },
      ],
    });
    console.log("✅ Correo enviado:", info.messageId);
    return res.status(200).json({ message: "Correo enviado" });
  } catch (err) {
    console.error("❌ Error sendMail:", err);
    return res.status(500).json({ error: "Error enviando correo" });
  }
}
