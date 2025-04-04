// pages/api/login.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { username, password } = req.body;

  // Accedemos a las variables de entorno definidas en .env.local
  const userSecret = process.env.USER_SECRET;
  const passwordSecret = process.env.PASSWORD_SECRET;

  if (username === userSecret && password === passwordSecret) {
    return res.status(200).json({ success: true });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Credenciales inválidas" });
  }
}
