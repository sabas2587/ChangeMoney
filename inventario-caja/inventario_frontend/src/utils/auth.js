import jwt_decode from 'jwt-decode'

export function getUserFromToken() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const decoded = jwt_decode(token)
    return decoded
  } catch (err) {
    return null
  }
}
