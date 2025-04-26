// 📁 services/directusAuth.service.js
const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

async function loginDirectus(email, password) {
  const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email,
    password,
  });

  return response.data.data.access_token;
}

async function getUserData(access_token) {
  const response = await axios.get(`${DIRECTUS_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  console.log('🧑 Usuario:', response.data.data);
  return response.data.data;
}

async function getRoleName(roleId, access_token) {
  const response = await axios.get(`${DIRECTUS_URL}/roles/${roleId}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  console.log('🎭 Rol:', response.data.data);
  return response.data.data.name.toLowerCase();
}

module.exports = {
  loginDirectus,
  getUserData,
  getRoleName,
};
