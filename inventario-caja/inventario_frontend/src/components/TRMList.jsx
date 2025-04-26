import { useEffect, useState } from 'react'
import axios from 'axios'

function TRMList() {
  const [tasas, setTasas] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ moneda: '', precio_compra: '', precio_venta: '' })

  const fetchTasas = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/tasas')
      const normalizadas = res.data.map(t => ({
        ...t,
        precio_compra: parseFloat(t.precio_compra),
        precio_venta: parseFloat(t.precio_venta)
      }))
      setTasas(normalizadas)
    } catch (err) {
      console.error('❌ Error cargando tasas:', err)
    }
  }

  useEffect(() => {
    fetchTasas()
  }, [])

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/tasas/${id}`)
      fetchTasas()
    } catch (err) {
      console.error('❌ Error eliminando tasa:', err)
    }
  }

  const startEdit = (tasa) => {
    setEditingId(tasa.id)
    setForm({
      moneda: tasa.moneda,
      precio_compra: tasa.precio_compra,
      precio_venta: tasa.precio_venta
    })
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      await axios.patch(`http://localhost:4000/api/tasas/${editingId}`, {
        moneda: form.moneda,
        precio_compra: parseFloat(form.precio_compra),
        precio_venta: parseFloat(form.precio_venta)
      })
      setEditingId(null)
      setForm({ moneda: '', precio_compra: '', precio_venta: '' })
      fetchTasas()
    } catch (err) {
      console.error('❌ Error actualizando tasa:', err)
    }
  }

  return (
    <div className="mt-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Historial de TRMs</h2>
      <table className="w-full text-left border">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="p-2">Moneda</th>
            <th className="p-2">Compra</th>
            <th className="p-2">Venta</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tasas.map((tasa) => (
            <tr key={tasa.id} className="border-t">
              {editingId === tasa.id ? (
                <>
                  <td className="p-2">
                    <input
                      value={form.moneda}
                      onChange={e => setForm({ ...form, moneda: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={form.precio_compra}
                      onChange={e => setForm({ ...form, precio_compra: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={form.precio_venta}
                      onChange={e => setForm({ ...form, precio_venta: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="p-2">
                    <button onClick={handleEdit} className="bg-green-600 text-white px-3 py-1 rounded mr-2">Guardar</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded">Cancelar</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-2">{tasa.moneda}</td>
                  <td className="p-2">${tasa.precio_compra.toFixed(2)}</td>
                  <td className="p-2">${tasa.precio_venta.toFixed(2)}</td>
                  <td className="p-2">
                    <button onClick={() => startEdit(tasa)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Editar</button>
                    <button onClick={() => handleDelete(tasa.id)} className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TRMList
