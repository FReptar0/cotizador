// pages/api/submit.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sólo POST permitido" });
  }

  // 1️⃣ Extrae del body los campos que corresponden a tus columnas A–Q
  const {
    customerName, // B: Nombre del prospecto
    customerCompany, // C: Empresa
    customerEmail, // D: Email
    customerPhone, // E: Telefono
    selectedModules, // F: Modulos seleccionados
    implementationType, // G: Tipo de implementacion
    nEmpresas, // H: Numero de empresas
    importacionDatos, // I: importacion de datos
    integraciones, // J: integraciones
    personalizaciones, // K: personalizaciones
    reportes, // L: reportes iespecializados
    orderRange, // M: rango de facturas (puede ser el valor numérico)
    multimoneda, // N: Multimoneda
    estimatedHours, // O: Horas estimadas
    licenseQuote, // P: Costo de licencias
    quote, // Q: Costo de implementacion
  } = req.body;

  // 2️⃣ Validación mínima
  if (!customerName || !customerEmail) {
    return res.status(400).json({ error: "Faltan Nombre o Correo" });
  }

  // 3️⃣ Autenticación con tu Service Account
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // Formatear orderRange para mostrar el rango correcto
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

  // Nuevo: determinar el valor de la plataforma de integración
  let integrationPlatformValue = "-";
  let integracionesValue = integraciones;
  if (integraciones === "sí" && req.body.integrationPlatform) {
    integrationPlatformValue = req.body.integrationPlatform.trim() || "-";
  } else if (integraciones === "no") {
    integracionesValue = "-";
    integrationPlatformValue = "-";
  }

  // 4️⃣ Prepara la fila en el mismo orden de tus columnas A–Q (ahora A–R)
  const row = [
    new Date().toLocaleString(), // A: Fecha
    customerName, // B
    customerCompany, // C
    customerEmail, // D
    customerPhone, // E
    Array.isArray(selectedModules)
      ? selectedModules.join("; ")
      : selectedModules || "", // F
    implementationType, // G
    nEmpresas, // H
    importacionDatos, // I
    integracionesValue, // J (ahora puede ser "-" si no)
    integrationPlatformValue, // K (nuevo campo: plataforma integración)
    personalizaciones, // L
    reportes, // M
    orderRangeFormatted, // N (usa el rango formateado)
    multimoneda, // O
    estimatedHours, // P
    licenseQuote, // Q
    quote, // R
  ];

  try {
    const sheetName = process.env.GOOGLE_SHEETS_TAB_NAME || "Respuestas";
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `${sheetName}!A:R`, // Ahora columnas A–R
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error guardando cotización en Sheets:", err);
    return res.status(500).json({ error: "No se pudo guardar en Sheets" });
  }
}
