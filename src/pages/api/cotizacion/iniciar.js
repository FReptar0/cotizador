// pages/api/cotizacion/iniciar.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST permitido" });
  }

  const {
    customerName,
    customerCompany,
    customerEmail,
    customerPhone,
    selectedModules,
    implementationType,
    nEmpresas,
    importacionDatos,
    integraciones,
    integrationPlatform,
    personalizaciones,
    reportes,
    orderRange,
    multimoneda,
    estimatedHours,
    licenseQuote,
    quote,
  } = req.body;

  if (!customerName || !customerEmail) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // 1. Generar ID único
    const cotizacionId = `cot_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 2. Guardar en Google Sheets PRIMERO
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    let orderRangeFormatted = orderRange;
    if (orderRange === 100 || orderRange === "100") {
      orderRangeFormatted = "0 a 100";
    } else if (orderRange === 200 || orderRange === "200") {
      orderRangeFormatted = "101 a 200";
    } else if (orderRange === 500 || orderRange === "500") {
      orderRangeFormatted = "201 a 500";
    } else if (Number(orderRange) > 500) {
      orderRangeFormatted = "Más de 500";
    }

    let integrationPlatformValue = "-";
    let integracionesValue = integraciones;
    if (integraciones === "sí" && integrationPlatform) {
      integrationPlatformValue = integrationPlatform.trim() || "-";
    } else if (integraciones === "no") {
      integracionesValue = "-";
      integrationPlatformValue = "-";
    }

    const row = [
      new Date().toLocaleString(),
      customerName,
      customerCompany,
      customerEmail,
      customerPhone,
      Array.isArray(selectedModules)
        ? selectedModules.join("; ")
        : selectedModules || "",
      implementationType,
      nEmpresas,
      importacionDatos,
      integracionesValue,
      integrationPlatformValue,
      personalizaciones,
      reportes,
      orderRangeFormatted,
      multimoneda,
      estimatedHours,
      licenseQuote,
      quote,
    ];

    const sheetName = process.env.GOOGLE_SHEETS_TAB_NAME || "Respuestas";
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `${sheetName}!A:R`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    // 3. Responder de inmediato. La generación y descarga del PDF la realiza
    //    el cliente llamando directamente a /api/cotizacion/procesar, de modo
    //    que el usuario obtiene su cotización aunque el correo esté deshabilitado.
    //    Este endpoint solo persiste el lead en Google Sheets.
    return res.status(200).json({
      ok: true,
      cotizacionId,
      message: "Cotización registrada.",
    });
  } catch (error) {
    console.error("Error iniciando cotización:", error);
    return res.status(500).json({ error: "Error al guardar cotización" });
  }
}
