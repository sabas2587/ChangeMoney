import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import TRMDashboard from './pages/TRMDashboard'
import CajeroTransaccion from './pages/CajaView'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Routes>
      {/* Ruta pública para el login */}
      <Route path="/" element={<Login />} />

      {/* Rutas protegidas para ADMIN */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/trm" element={<TRMDashboard />} />
      </Route>

      {/* Rutas protegidas para CAJERO */}
      <Route element={<PrivateRoute allowedRoles={['cajero']} />}>
        <Route path="/caja" element={<CajeroTransaccion />} />
      </Route>
    </Routes>
  )
}

export default App
