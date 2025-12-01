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
    hosteo,
    tipoMoneda = "MXN",
    exchangeRate = 19,
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

    // 3. Iniciar proceso en background (NO ESPERAR respuesta)
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = req.headers.host;
    const backgroundUrl = `${protocol}://${host}/api/cotizacion/procesar`;

    fetch(backgroundUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cotizacionId,
        customerName,
        customerCompany,
        customerEmail,
        selectedModules,
        licenseQuote,
        quote,
        hosteo,
        estimatedHours,
        tipoMoneda,
        exchangeRate,
      }),
    }).catch((err) => console.error("Error iniciando background:", err));

    // 4. Responder INMEDIATAMENTE
    return res.status(200).json({
      ok: true,
      cotizacionId,
      message:
        "Cotización guardada. Recibirás tu propuesta por correo en 2-3 minutos.",
    });
  } catch (error) {
    console.error("Error iniciando cotización:", error);
    return res.status(500).json({ error: "Error al guardar cotización" });
  }
}
