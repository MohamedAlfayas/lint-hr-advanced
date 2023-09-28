import React from 'react'
import { Navigate } from 'react-router';

const PublicRoute = ({children}) => {

  const token = JSON.parse(localStorage.getItem("lint_hr_token"));
  console.log("token Private = ", token);
  const isValidUser = token && token?.access ? token?.access : null

  return (
    !!isValidUser ? <Navigate to="/" /> : <React.Fragment>{children}</React.Fragment>
  )
}

export default PublicRoute