import React from 'react'
import { Navigate } from 'react-router';

const PublicRoute = ({children}) => {

  const isValidUser = localStorage.getItem("token");
  console.log("token = " , isValidUser)

  return (
    !!isValidUser ? <Navigate to="/" /> : <React.Fragment>{children}</React.Fragment>
  )
}

export default PublicRoute