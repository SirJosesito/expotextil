import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Si no hay token, lo redirigimos al login
    return <Navigate to="/login" replace />;
  }

  // Si hay token, lo dejamos ver el componente hijo (ej: Checkout)
  return children;
};

export default ProtectedRoute;
