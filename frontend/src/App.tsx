import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import PaymentStatus from './pages/PaymentStatus';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Contenedor principal con fondo oscuro para toda la página */}
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0a', 
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif' 
      }}>
        <Header />
        
        {/* Contenedor de las rutas (sin max-width para que el Hero se expanda) */}
        <div style={{ width: '100%' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rutas Privadas */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            <Route path="/checkout" element={
              <ProtectedRoute>
                <div style={{ backgroundColor: '#fafafa', color: '#000', minHeight: 'calc(100vh - 80px)' }}>
                  <div style={{ maxWidth: '1200px', margin: '0 auto', boxShadow: '0 0 15px rgba(0,0,0,0.05)' }}>
                    <Checkout />
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/checkout/exito" element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>} />
            <Route path="/checkout/fallo" element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>} />
            <Route path="/checkout/pendiente" element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>} />
          </Routes>
        </div>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;