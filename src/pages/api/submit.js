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

  // 4️⃣ Prepara la fila en el mismo orden de tus columnas A–Q
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
    integraciones, // J
    personalizaciones, // K
    reportes, // L
    orderRange, // M
    multimoneda, // N
    estimatedHours, // O
    licenseQuote, // P
    quote, // Q
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Respuestas!A:Q", // ✅ indicamos columnas A–Q
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
