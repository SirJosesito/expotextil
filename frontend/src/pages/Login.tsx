import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('correo') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar el token y el rol
      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.rol);

      // Redirigir a la página principal
      navigate('/');
      
      // Forzamos la recarga de la ventana para que el Header reconozca la sesión iniciada
      // (En el futuro, esto se mejorará usando React Context para el estado global)
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 80px)', backgroundColor: '#111111' }}>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#ffffff', fontSize: '3rem', marginBottom: '0.5rem', fontWeight: '900' }}>Bienvenido</h1>
        <p style={{ color: '#cccccc', fontSize: '1.2rem' }}>Inicia sesión para gestionar tu stand o comprar uno nuevo</p>
      </div>

      <div className="resp-padding" style={{
        backgroundColor: '#ffffff', padding: '4rem', borderRadius: '24px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.4)', width: '100%',
        maxWidth: '500px', borderTop: '6px solid #ff0000'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {error && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '8px', border: '1px solid #ef9a9a' }}>
              {error}
            </div>
          )}

          {/* Correo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
            <label htmlFor="correo" style={{ fontWeight: '600', color: '#555', fontSize: '1rem' }}>Correo electrónico</label>
            <input
              id="correo"
              type="email"
              name="correo"
              required
              style={{ width: '100%', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', boxSizing: 'border-box', backgroundColor: '#f9f9f9' }}
            />
          </div>

          {/* Contraseña */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
            <label htmlFor="password" style={{ fontWeight: '600', color: '#555', fontSize: '1rem' }}>Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              required
              style={{ width: '100%', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', boxSizing: 'border-box', backgroundColor: '#f9f9f9' }}
            />
          </div>

          {/* Botón */}
          <div style={{ marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#ccc' : '#e60000', color: 'white', border: 'none', padding: '18px',
                borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase', transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#cc0000' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#e60000' }}
            >
              {loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
            </button>
          </div>
          
          {/* Redirección a Registro */}
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1.05rem', color: '#555' }}>
            ¿No tenés una cuenta? <Link to="/registro" style={{ color: '#e60000', fontWeight: 'bold', textDecoration: 'none' }}>Registrate aquí</Link>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Login;
