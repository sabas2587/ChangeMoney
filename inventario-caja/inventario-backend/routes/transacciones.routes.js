const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const DIRECTUS_URL = process.env.DIRECTUS_URL;
const DIRECTUS_STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

router.post('/', async (req, res) => {
  try {
    console.log('📩 Solicitud recibida en /api/transacciones');
    console.log('📦 Cuerpo de la solicitud:', req.body);

    const { tipo, moneda_origen, moneda_destino, monto, numero_formulario, usuario_id } = req.body;

    if (!tipo || !moneda_origen || !moneda_destino || !monto) {
      return res.status(400).json({ error: 'Faltan datos para procesar la transacción' });
    }

    // Solo validar formulario si es una venta de USD/EUR entre 201 y 3000
    if (tipo === 'venta' && ['USD', 'EUR'].includes(moneda_destino) && monto >= 201 && monto <= 3000) {
      if (!numero_formulario) {
        return res.status(400).json({ error: 'Debe ingresar el número del formulario físico para montos entre 201 y 3000.' });
      }
    }

    const headers = { Authorization: `Bearer ${DIRECTUS_STATIC_TOKEN}` };

    let monto_resultado = 0;
    let ganancia = 0;

    if (moneda_origen === 'COP' || moneda_destino === 'COP') {
      const divisa = moneda_origen === 'COP' ? moneda_destino : moneda_origen;
      const tasaRes = await axios.get(`${DIRECTUS_URL}/items/tasas_cambio?filter[moneda][_eq]=${divisa}`, { headers });
      const tasa = tasaRes.data?.data?.[0];

      if (!tasa) return res.status(404).json({ error: 'Tasa de cambio no encontrada para esta moneda' });

      const compra = parseFloat(tasa.precio_compra);
      const venta = parseFloat(tasa.precio_venta);

      if (tipo === 'venta') {
        monto_resultado = monto / venta;
        ganancia = (venta - compra) * monto_resultado;
      } else if (tipo === 'compra') {
        monto_resultado = monto * compra;
        ganancia = 0;
      }

    } else {
      const tasaOrigen = await axios.get(`${DIRECTUS_URL}/items/tasas_cambio?filter[moneda][_eq]=${moneda_origen}`, { headers });
      const tasaDestino = await axios.get(`${DIRECTUS_URL}/items/tasas_cambio?filter[moneda][_eq]=${moneda_destino}`, { headers });
      const directa = await axios.get(`${DIRECTUS_URL}/items/tasas_directas?filter[moneda_origen][_eq]=${moneda_origen}&filter[moneda_destino][_eq]=${moneda_destino}`, { headers });

      const t1 = tasaOrigen.data?.data?.[0];
      const t2 = tasaDestino.data?.data?.[0];
      const directaTasa = directa.data?.data?.[0];

      if (!t1 || !t2 || !directaTasa) {
        return res.status(404).json({ error: 'Tasa cruzada o directa no encontrada' });
      }

      const pesos = monto * parseFloat(t1.precio_compra);
      monto_resultado = pesos / parseFloat(t2.precio_venta);
      ganancia = pesos - (monto * parseFloat(directaTasa.precio));
    }

    const payload = {
      tipo,
      moneda: `${moneda_origen}→${moneda_destino}`,
      monto: parseFloat(monto.toFixed(2)),
      monto_resultado: parseFloat(monto_resultado.toFixed(2)),
      ganancia: parseFloat(ganancia.toFixed(2)),
      fecha: new Date().toISOString().split('T')[0],
    };

    if (numero_formulario) {
      payload.numero_formulario = numero_formulario;
    }

    if (usuario_id) {
      payload.usuario = usuario_id;
    }

    const r = await axios.post(`${DIRECTUS_URL}/items/transacciones`, payload, { headers });

    res.json({ data: r.data.data, mensaje: '✅ Transacción registrada correctamente' });

  } catch (err) {
    console.error('❌ Error al registrar transacción:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error al registrar transacción' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { tipo, moneda, fecha, numero_formulario } = req.query;
    let filterQuery = [];

    if (tipo) filterQuery.push(`filter[tipo][_eq]=${tipo}`);
    if (moneda) filterQuery.push(`filter[moneda][_contains]=${moneda}`);
    if (fecha) filterQuery.push(`filter[fecha][_eq]=${fecha}`);
    if (numero_formulario) filterQuery.push(`filter[numero_formulario][_eq]=${numero_formulario}`);

    const url = `${DIRECTUS_URL}/items/transacciones?fields=*,usuario.id,usuario.first_name,usuario.last_name&sort=-fecha${
      filterQuery.length ? '&' + filterQuery.join('&') : ''
    }`;

    const r = await axios.get(url, {
      headers: { Authorization: `Bearer ${DIRECTUS_STATIC_TOKEN}` },
    });

    res.json(r.data.data);
  } catch (err) {
    console.error('❌ Error obteniendo transacciones:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

module.exports = router;
