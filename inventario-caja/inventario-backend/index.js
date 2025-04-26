const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const tasasRouter = require('./routes/tasas.routes')
const monedasRoutes = require('./routes/monedas.routes')
const transaccionesRouter = require('./routes/transacciones.routes')



const app = express();
app.use(cors());
app.use(express.json());

// Rutas públicas
app.use('/api/auth', authRoutes);
app.use('/api/tasas', tasasRouter);
app.use('/api/monedas', monedasRoutes)
app.use('/api/transacciones', transaccionesRouter)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});
