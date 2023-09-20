import React from 'react'
import { Navigate } from 'react-router';

const PrivateRoute = ({children}) => {
  const isValidUser = (localStorage.getItem("token"));
  console.log("token Private = ", isValidUser)
  return (
    !!isValidUser ? <>{children}</> : <Navigate to="/login" />
  )
}

export default PrivateRoute