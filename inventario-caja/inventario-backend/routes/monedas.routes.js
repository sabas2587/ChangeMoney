const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const DIRECTUS_URL = process.env.DIRECTUS_URL;
const DIRECTUS_STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

router.get('/', async (req, res) => {
  try {
    const fieldUrl = `${DIRECTUS_URL}/fields/tasas_cambio/moneda`;

    const response = await axios.get(fieldUrl, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_STATIC_TOKEN}`,
      },
    });

    const choices = response.data?.data?.meta?.options?.choices || [];
    res.json(choices);
  } catch (error) {
    console.error('❌ Error al obtener monedas:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al obtener monedas desde Directus' });
  }
});

module.exports = router;
