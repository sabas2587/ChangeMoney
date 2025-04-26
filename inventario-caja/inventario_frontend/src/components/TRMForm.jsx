import { useEffect, useState } from 'react'
import axios from 'axios'

const TRMForm = () => {
  const [moneda, setMoneda] = useState('')
  const [precioCompra, setPrecioCompra] = useState('')
  const [precioVenta, setPrecioVenta] = useState('')
  const [monedas, setMonedas] = useState([])
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const fetchMonedas = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/monedas')
        setMonedas(res.data)
        console.log('✅ Monedas cargadas:', res.data)
      } catch (error) {
        console.error('❌ Error al obtener monedas:', error)
        setMensaje('Error cargando las monedas')
      }
    }
    fetchMonedas()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')
  
    if (!moneda || !precioCompra || !precioVenta) {
      return setMensaje('❌ Todos los campos son obligatorios')
    }
  
    try {
      const encodedMoneda = encodeURIComponent(moneda)
      const checkURL = `http://localhost:8055/items/tasas_cambio?filter%5Bmoneda%5D%5B_eq%5D=${encodedMoneda}`
  
      const existing = await axios.get(checkURL, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_DIRECTUS_STATIC_TOKEN}`
        }
      })
  
      console.log('🔍 Verificando existencia de moneda:', existing.data)
  
      if (existing.data.data.length > 0) {
        return setMensaje('⚠️ Esta moneda ya está registrada')
      }
  
      // Si no existe, registrar
      const response = await axios.post(
        'http://localhost:8055/items/tasas_cambio',
        {
          moneda,
          precio_compra: parseFloat(precioCompra),
          precio_venta: parseFloat(precioVenta),
          fecha: new Date().toISOString().split('T')[0],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_DIRECTUS_STATIC_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )
  
      console.log('✅ Registro exitoso:', response.data)
      setMensaje('✅ TRM registrada correctamente')
      setMoneda('')
      setPrecioCompra('')
      setPrecioVenta('')
    } catch (error) {
      console.error('❌ Error registrando TRM:', error)
      setMensaje('❌ Ocurrió un error al registrar la TRM')
    }
  }
  

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded shadow-md mt-8">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-900">Registrar TRM</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Moneda</label>
          <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Seleccione una moneda</option>
            {monedas.map((m) => (
              <option key={m.value} value={m.value}>{m.text}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Precio Compra</label>
          <input type="number" step="0.01" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)}
            className="w-full p-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Precio Venta</label>
          <input type="number" step="0.01" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)}
            className="w-full p-2 border rounded" required />
        </div>

        <button type="submit" className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700">Guardar</button>

        {mensaje && <p className="mt-4 text-center font-semibold text-sm text-red-600">{mensaje}</p>}
      </form>
    </div>
  )
}

export default TRMForm
