import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF', '#FF6384', '#36A2EB', '#4BC0C0']

function TransaccionesList() {
  const [transacciones, setTransacciones] = useState([])
  const [filtroGlobal, setFiltroGlobal] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('http://localhost:4000/api/transacciones', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setTransacciones(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Error cargando transacciones:', err)
        setTransacciones([])
      }
    }
    fetchData()
  }, [])

  if (!Array.isArray(transacciones)) return <p className="text-red-500">❌ Error cargando transacciones</p>

  const transaccionesFiltradas = transacciones.filter(t => {
    const texto = filtroGlobal.toLowerCase()
    const dentroRango = (!fechaInicio || t.fecha >= fechaInicio) && (!fechaFin || t.fecha <= fechaFin)
    return dentroRango && (
      t.tipo.toLowerCase().includes(texto) ||
      t.moneda.toLowerCase().includes(texto) ||
      t.fecha.toLowerCase().includes(texto) ||
      t.numero_formulario?.toLowerCase().includes(texto) ||
      `${t.usuario?.first_name || ''} ${t.usuario?.last_name || ''}`.toLowerCase().includes(texto) ||
      t.id.toString().includes(texto) ||
      t.monto.toString().includes(texto) ||
      t.monto_resultado.toString().includes(texto)
    )
  })

  const monedas = [...new Set(transaccionesFiltradas.map(t => t.moneda))]
  const fechas = [...new Set(transaccionesFiltradas.map(t => t.fecha))].sort()

  const datosGrafico = fechas.map(fecha => {
    const row = { fecha }
    monedas.forEach(moneda => {
      row[moneda] = transaccionesFiltradas
        .filter(t => t.fecha === fecha && t.moneda === moneda)
        .reduce((acc, t) => acc + parseFloat(t.monto_resultado), 0)
    })
    return row
  })

  const totalTransacciones = transaccionesFiltradas.length

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">📊 Transacciones (Total: {totalTransacciones})</h2>

      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Filtrar por cualquier campo..."
          value={filtroGlobal}
          onChange={(e) => setFiltroGlobal(e.target.value)}
          className="p-3 border border-gray-300 rounded w-full max-w-xs"
        />
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="p-3 border border-gray-300 rounded"
        />
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="p-3 border border-gray-300 rounded"
        />
      </div>

      <div className="h-[500px] bg-white rounded shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Montos por Fecha y Moneda</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datosGrafico}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <Tooltip formatter={(value) => `$${Math.round(value).toLocaleString('es-CO')}`} />
            <Legend />
            {monedas.map((moneda, index) => (
              <Bar
                key={moneda}
                dataKey={moneda}
                name={moneda}
                fill={COLORS[index % COLORS.length]}
              >
                <LabelList dataKey={moneda} position="top" formatter={(value) => Math.round(value).toLocaleString('es-CO')} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full table-auto text-sm text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Moneda</th>
              <th className="px-4 py-2">Monto</th>
              <th className="px-4 py-2">Resultado</th>
              <th className="px-4 py-2">Formulario</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {transaccionesFiltradas.map((t, i) => (
              <tr key={t.id} className="border-t hover:bg-gray-100">
                <td className="px-4 py-2">{t.id}</td>
                <td className="px-4 py-2">{t.tipo}</td>
                <td className="px-4 py-2">{t.moneda}</td>
                <td className="px-4 py-2">{Math.round(parseFloat(t.monto)).toLocaleString('es-CO')}</td>
                <td className="px-4 py-2">{Math.round(parseFloat(t.monto_resultado)).toLocaleString('es-CO')}</td>
                <td className="px-4 py-2">{t.numero_formulario || '-'}</td>
                <td className="px-4 py-2">{t.fecha}</td>
                <td className="px-4 py-2">{t.usuario ? `${t.usuario.first_name} ${t.usuario.last_name || ''}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TransaccionesList
