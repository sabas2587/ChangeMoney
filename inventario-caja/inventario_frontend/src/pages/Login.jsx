import { useState } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const login = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', { email, password })
      const token = res.data.token
      localStorage.setItem('token', token)

      const { rol } = jwtDecode(token)
      if (rol === 'admin') navigate('/admin')
      else if (rol === 'cajero') navigate('/caja')
      else navigate('/')
    } catch {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-800">
      <form onSubmit={login} className="bg-white p-10 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-900">Cambio Opita</h2>
        <input type="email" className="w-full mb-4 p-3 border rounded" placeholder="Correo"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" className="w-full mb-4 p-3 border rounded" placeholder="Contraseña"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded">
          Ingresar
        </button>
      </form>
    </div>
  )
}

export default Login
