import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Login from './pages/Login';
import PagosMockup from './pages/PagosMockup';

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
            <Route path="/registro" element={<Registro />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pagos" element={
              <div style={{ backgroundColor: '#fafafa', color: '#000', minHeight: 'calc(100vh - 80px)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', boxShadow: '0 0 15px rgba(0,0,0,0.05)' }}>
                  <PagosMockup />
                </div>
              </div>
            } />
          </Routes>
        </div>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;