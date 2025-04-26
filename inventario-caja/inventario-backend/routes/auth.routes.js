// 📁 routes/auth.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const {
  loginDirectus,
  getUserData,
  getRoleName,
} = require('../services/directusAuth.service');

const SECRET_KEY = process.env.JWT_SECRET || 'cambio_opita_secreto';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Autenticar usuario
    const access_token = await loginDirectus(email, password);

    // 2. Obtener el usuario desde Directus
    const user = await getUserData(access_token);
    if (!user || !user.role) {
      return res.status(403).json({ error: 'No se pudo obtener el rol del usuario' });
    }

    // 3. Obtener el nombre del rol legible
    const roleName = await getRoleName(user.role, access_token);

    // 4. Firmar token personalizado
    const tokenPayload = {
      id: user.id,
      email: user.email,
      rol: roleName, // ej: admin, cajero
    };

    const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ error: 'Credenciales incorrectas o error de autenticación' });
  }
});

module.exports = router;
