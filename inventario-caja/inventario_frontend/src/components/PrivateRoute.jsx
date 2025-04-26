import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token')

  if (!token) return <Navigate to="/" />

  try {
    const { rol } = jwtDecode(token)
    console.log('ROL DECODIFICADO:', rol)
    if (allowedRoles.includes(rol)) {
      return <Outlet />
    } else {
      return <Navigate to="/" />
    }
  } catch (e) {
    return <Navigate to="/" />
  }
}

export default PrivateRoute
