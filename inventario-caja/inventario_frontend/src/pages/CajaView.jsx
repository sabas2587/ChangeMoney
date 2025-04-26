import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

function CajeroTransaccion() {
  const [tipo, setTipo] = useState('venta')
  const [monedaOrigen, setMonedaOrigen] = useState('COP')
  const [monedaDestino, setMonedaDestino] = useState('')
  const [monto, setMonto] = useState('')
  const [resultado, setResultado] = useState(0)
  const [ganancia, setGanancia] = useState(0)
  const [monedas, setMonedas] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [formularioVisible, setFormularioVisible] = useState(false)
  const [numeroFormulario, setNumeroFormulario] = useState('')
  const [formularioTipo, setFormularioTipo] = useState('')
  const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(false)

  useEffect(() => {
    const fetchMonedas = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/monedas')
        setMonedas(res.data)
      } catch {
        setMensaje('❌ Error al cargar monedas')
      }
    }
    fetchMonedas()
  }, [])

  const formatearMiles = (num) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(num)

  const limpiarCampos = () => {
    setMonto('')
    setNumeroFormulario('')
    setFormularioVisible(false)
    setFormularioTipo('')
  }

  const handleMontoChange = async (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    const formatted = raw ? parseInt(raw).toLocaleString('es-CO') : ''
    setMonto(formatted)

    if (raw) {
      await simularCambio(parseFloat(raw))
    } else {
      setResultado(0)
    }
  }

  const simularCambio = async (montoSimulado) => {
    try {
      const token = localStorage.getItem('token')
      let tasaOrigen = null
      let tasaDestino = null
      let resultadoCalculado = 0

      if (monedaOrigen !== 'COP') {
        const resOrigen = await axios.get(`http://localhost:4000/api/tasas?moneda=${monedaOrigen}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        tasaOrigen = resOrigen.data?.[0]
      }

      if (monedaDestino !== 'COP') {
        const resDestino = await axios.get(`http://localhost:4000/api/tasas?moneda=${monedaDestino}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        tasaDestino = resDestino.data?.[0]
      }

      if (!tasaOrigen && !tasaDestino) {
        setResultado(0)
        return setMensaje('❌ No se encontraron tasas para calcular')
      }

      if (tipo === 'venta') {
        if (monedaOrigen === 'COP' && tasaDestino) {
          resultadoCalculado = montoSimulado / parseFloat(tasaDestino.precio_venta)
        } else if (monedaDestino === 'COP' && tasaOrigen) {
          resultadoCalculado = montoSimulado * parseFloat(tasaOrigen.precio_compra)
        }
      } else if (tipo === 'compra') {
        if (monedaDestino === 'COP' && tasaOrigen) {
          resultadoCalculado = montoSimulado * parseFloat(tasaOrigen.precio_compra)
        } else if (monedaOrigen === 'COP' && tasaDestino) {
          resultadoCalculado = montoSimulado / parseFloat(tasaDestino.precio_venta)
        }
      }

      setResultado(resultadoCalculado)
    } catch (error) {
      console.error('❌ Error en la simulación:', error)
      setResultado(0)
      setMensaje('❌ Error calculando el cambio')
    }
  }

  const calcular = async () => {
    const m = parseFloat(monto.replace(/\./g, '').replace(',', '')) || 0
    const monedaRiesgo = ['USD', 'EUR']
    let referencia = m

    if (monedaOrigen === 'COP' && monedaRiesgo.includes(monedaDestino)) {
      const tasaRes = await axios.get(`http://localhost:4000/api/tasas?moneda=${monedaDestino}`)
      const tasa = tasaRes.data?.[0]
      if (!tasa) return setMensaje('❌ No se encontró la tasa')
      referencia = m / parseFloat(tasa.precio_venta)
    }

    if ((monedaRiesgo.includes(monedaOrigen) || monedaRiesgo.includes(monedaDestino))) {
      if (referencia > 3000) return setMensaje('❌ No se permite la operación por superar el límite de 3000 USD/EUR')
      if (referencia >= 501 && !numeroFormulario) {
        setFormularioTipo('518')
        setFormularioVisible(true)
        setEsperandoConfirmacion(true)
        return setMensaje('⚠️ Ingrese el número del formulario 518 antes de continuar')
      }
      if (referencia >= 201 && !numeroFormulario) {
        setFormularioTipo('536')
        setFormularioVisible(true)
        setEsperandoConfirmacion(true)
        return setMensaje('⚠️ Ingrese el número del formulario 536 antes de continuar')
      }
    }

    try {
      const token = localStorage.getItem('token')
      const decoded = jwtDecode(token)
      const usuario_id = decoded?.id || decoded?.user?.id

      const payload = {
        tipo,
        moneda_origen: monedaOrigen,
        moneda_destino: monedaDestino,
        monto: m,
        numero_formulario: numeroFormulario || null,
        usuario_id
      }

      const res = await axios.post('http://localhost:4000/api/transacciones', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setResultado(res.data.data.monto_resultado)
      setMensaje(res.data.mensaje || '✅ Transacción registrada correctamente')
      limpiarCampos()
      setTimeout(() => {
        setResultado(0)
        setMensaje('')
      }, 5000)
    } catch (err) {
      console.error(err)
      setMensaje('❌ Error registrando transacción')
    }
  }

  return (
    <div className="min-h-screen bg-blue-800">
      <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-4xl font-bold">💱 Cajero</h1>
        <nav className="flex gap-6">
          <button onClick={() => alert('📊 Gastos no implementado aún')} className="text-lg hover:underline">📊 Gastos</button>
          <button onClick={() => alert('📝 Funcionalidad de autorización TRM pendiente')} className="text-lg hover:underline">📝 Cambiar Tasa</button>
        </nav>
      </header>

      <div className="p-8 max-w-6xl mx-auto bg-white rounded-md shadow-md mt-8">
        <h2 className="text-5xl font-bold text-center text-blue-900 mb-10">Cambio de Divisas</h2>

        <div className="flex justify-center gap-8 mb-10">
          <button onClick={() => setTipo('venta')} className={`w-1/2 py-8 text-4xl font-bold rounded ${tipo === 'venta' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
            💰 VENDER
          </button>
          <button onClick={() => setTipo('compra')} className={`w-1/2 py-8 text-4xl font-bold rounded ${tipo === 'compra' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
            🪙 COMPRAR
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Moneda Origen</label>
            <select value={monedaOrigen} onChange={(e) => setMonedaOrigen(e.target.value)} className="w-full p-5 text-2xl border border-gray-300 rounded">
              {monedas.map((m) => <option key={m.value} value={m.value}>{m.text}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Moneda Destino</label>
            <select value={monedaDestino} onChange={(e) => setMonedaDestino(e.target.value)} className="w-full p-5 text-2xl border border-gray-300 rounded">
              <option value="">Seleccione una moneda</option>
              {monedas.map((m) => <option key={m.value} value={m.value}>{m.text}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Monto a cambiar</label>
            <input
              type="text"
              placeholder="Monto"
              value={monto}
              onChange={handleMontoChange}
              className="w-full mb-4 p-5 text-3xl border border-gray-300 rounded text-center"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Vista Previa</label>
            <input
              type="text"
              value={formatearMiles(resultado)}
              disabled
              className="w-full mb-4 p-5 text-3xl border border-gray-300 rounded text-center bg-gray-100"
            />
          </div>
        </div>

        {formularioVisible && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p className="text-xl">⚠️ Debe llenar el formulario <strong>{formularioTipo}</strong></p>
            <input
              type="text"
              placeholder="Número del formulario"
              value={numeroFormulario}
              onChange={(e) => setNumeroFormulario(e.target.value)}
              className="mt-3 w-full p-4 text-lg border rounded"
              required
            />
          </div>
        )}

        <div className="flex flex-col gap-6 mt-8">
          <button onClick={calcular} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold p-6 text-3xl rounded">
            {formularioVisible ? 'Continuar' : 'Registrar Transacción'}
          </button>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-6xl font-extrabold text-green-600">{resultado > 0 && formatearMiles(resultado)}</h3>
        </div>

        <div className={`text-center text-2xl mt-8 transition-opacity duration-1000 ${mensaje ? 'opacity-100' : 'opacity-0'}`}>
          {mensaje && (
            <p className={`${mensaje.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{mensaje}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CajeroTransaccion
