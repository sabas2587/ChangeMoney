const axios = require('axios');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Hacemos login con Directus
    const authRes = await axios.post('http://localhost:8055/auth/login', {
      email,
      password
    });

    const token = authRes.data.data.access_token;
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    const roleId = decoded.role;

    // 2. Obtenemos el nombre del rol
    const roleRes = await axios.get(`http://localhost:8055/roles/${roleId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const roleName = roleRes.data.data.name;

    // 3. Devolvemos el token + el nombre del rol
    return res.json({
      token,
      rol: roleName
    });

  } catch (err) {
    console.error('Error de login:', err.message);
    return res.status(401).json({ error: 'No se pudo obtener el rol del usuario' });
  }
};

module.exports = login;
