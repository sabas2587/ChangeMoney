// src/pages/AdminDashboard.jsx
import { useState } from 'react'
import TRMForm from '../components/TRMForm'
import TRMList from '../components/TRMList'
import TransaccionesList from '../components/TransaccionesList' // ✅ Nuevo import

function AdminDashboard() {
  const [vista, setVista] = useState('form') // 'form' | 'list' | 'transacciones'

  return (
    <div className="min-h-screen flex">
      {/* Menú lateral */}
      <aside className="w-64 bg-blue-900 text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Cambio Opita</h2>

        <button
          onClick={() => setVista('form')}
          className="block w-full text-left bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded"
        >
          ➕ Nueva TRM
        </button>

        <button
          onClick={() => setVista('list')}
          className="block w-full text-left bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded"
        >
          📋 Listar TRM
        </button>

        <button
          onClick={() => setVista('transacciones')}
          className="block w-full text-left bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded"
        >
          📊 Transacciones
        </button>
      </aside>

      {/* Contenido dinámico */}
      <main className="flex-1 bg-gray-100 p-10 overflow-auto">
        {vista === 'form' && <TRMForm />}
        {vista === 'list' && <TRMList />}
        {vista === 'transacciones' && <TransaccionesList />} {/* ✅ Nueva vista */}
      </main>
    </div>
  )
}

export default AdminDashboard
