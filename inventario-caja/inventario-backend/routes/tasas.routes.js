// routes/tasas.routes.js
const express = require('express')
const axios = require('axios')
const router = express.Router()
require('dotenv').config()

const DIRECTUS_URL = process.env.DIRECTUS_URL
const DIRECTUS_STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN

// 🔁 Crear nueva tasa
router.post('/', async (req, res) => {
    try {
      const { moneda, precio_compra, precio_venta, fecha } = req.body;
  
      // 🔍 Log de entrada
      console.log('📥 Intentando registrar tasa:', { moneda, precio_compra, precio_venta, fecha });
  
      // ✅ Verificar si ya existe una tasa con la misma moneda
      const url = `${DIRECTUS_URL}/items/tasas_cambio?filter[moneda][_eq]=${encodeURIComponent(moneda)}`;
      console.log('🔍 Verificando existencia con URL:', url);
  
      const checkResponse = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_STATIC_TOKEN}`,
        },
      });
  
      const yaExiste = checkResponse.data?.data?.length > 0;
  
      if (yaExiste) {
        console.log('⚠️ Moneda ya registrada:', moneda);
        return res.status(400).json({ error: `Ya existe una tasa registrada para la moneda ${moneda}` });
      }
  
      // ✅ Insertar nueva tasa
      const insertResponse = await axios.post(`${DIRECTUS_URL}/items/tasas_cambio`, {
        moneda,
        precio_compra,
        precio_venta,
        fecha,
      }, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_STATIC_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('✅ Tasa registrada con éxito:', insertResponse.data);
      res.json({ data: insertResponse.data });
    } catch (err) {
      console.error('❌ Error al guardar tasa:', err.response?.data || err.message);
      res.status(500).json({ error: 'Error al guardar tasa de cambio' });
    }
  });

// 📄 Listar tasas (todas o filtradas por moneda)
router.get('/', async (req, res) => {
  try {
    const { moneda } = req.query;

    const url = moneda 
      ? `${DIRECTUS_URL}/items/tasas_cambio?filter[moneda][_eq]=${encodeURIComponent(moneda)}`
      : `${DIRECTUS_URL}/items/tasas_cambio`;

    console.log('🌐 URL consulta tasas:', url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${DIRECTUS_STATIC_TOKEN}`,
      },
    })

    res.json(response.data.data)
  } catch (error) {
    console.error('❌ Error listando tasas:', error.response?.data || error.message)
    res.status(500).json({ error: 'Error al listar tasas' })
  }
})


  // Editar una tasa por ID
router.patch('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { moneda, precio_compra, precio_venta } = req.body;
  
      const response = await axios.patch(`${DIRECTUS_URL}/items/tasas_cambio/${id}`, {
        moneda,
        precio_compra,
        precio_venta
      }, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_STATIC_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
  
      res.json({ data: response.data });
    } catch (err) {
      console.error('❌ Error actualizando tasa:', err.response?.data || err.message);
      res.status(500).json({ error: 'Error al actualizar tasa de cambio' });
    }
  });
  
  // Eliminar una tasa por ID
router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      await axios.delete(`${DIRECTUS_URL}/items/tasas_cambio/${id}`, {
        headers: {
          Authorization: `Bearer ${DIRECTUS_STATIC_TOKEN}`,
        }
      });
  
      res.json({ success: true });
    } catch (err) {
      console.error('❌ Error eliminando tasa:', err.response?.data || err.message);
      res.status(500).json({ error: 'Error al eliminar tasa de cambio' });
    }
  });
  

module.exports = router
