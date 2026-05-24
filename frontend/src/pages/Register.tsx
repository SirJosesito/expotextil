import React, { useState } from 'react';
import { Link, } from 'react-router-dom';

const Register: React.FC = () => {
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const empresa = formData.get('empresa') as string;
    const nombre = formData.get('nombre') as string;
    const correo = formData.get('correo') as string;
    const telefono = formData.get('telefono') as string;
    const password = formData.get('password') as string;

    // Validación estricta del teléfono (12 caracteres numéricos)
    if (!/^\d{12}$/.test(telefono)) {
      setError("El número de teléfono debe tener exactamente 12 dígitos numéricos (ej: 543451112222).");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ empresa, nombre, email: correo, telefono, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el usuario');
      }

      // Auto-Login: Guardar el token devuelto por la API
      localStorage.setItem('token', data.token);

      setRegistroExitoso(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '1rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#111111' }}>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#ffffff', fontSize: '3rem', marginBottom: '0.5rem', fontWeight: '900' }}>Registro de Marcas</h1>
        <p style={{ color: '#cccccc', fontSize: '1.2rem' }}>Crea tu cuenta para poder adquirir un stand y participar en la Expo</p>
      </div>

      <div className="resp-padding" style={{
        backgroundColor: '#ffffff', padding: '4rem', borderRadius: '24px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.4)', width: '100%',
        maxWidth: '900px', borderTop: '6px solid #ff0000'
      }}>

        {registroExitoso ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '5rem', color: '#4caf50', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ color: '#2e7d32', marginBottom: '1rem', fontSize: '2rem' }}>¡Registro Exitoso!</h2>
            <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Tu cuenta ha sido creada y has iniciado sesión automáticamente.
            </p>
            <button
              onClick={() => { window.location.href = '/'; }} 
              style={{
                backgroundColor: '#e60000', color: 'white', border: 'none',
                padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem'
              }}
            >
              Ir al Inicio
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.20rem' }}>
            
            {error && (
              <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '8px', border: '1px solid #ef9a9a' }}>
                {error}
              </div>
            )}

            {/* Empresa */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              <label htmlFor="empresa" style={{ fontWeight: '600', color: '#555', fontSize: '1rem' }}>Nombre de la empresa *</label>
              <input
                id="empresa"
                type="text"
                name="empresa"
                required
                style={{ width: '100%', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', boxSizing: 'border-box', backgroundColor: '#f9f9f9' }}
              />
            </div>

            {/* Nombre */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              <label htmlFor="nombre" style={{ fontWeight: '600', color: '#555', fontSize: '1rem' }}>Nombre y apellido del responsable *</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                required
                style={{ width: '100%', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', boxSizing: 'border-box', backgroundColor: '#f9f9f9' }}
              />
            </div>

            {/* Correo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              <label htmlFor="correo" style={{ fontWeight: '600', color: '#555', fontSize: '1rem' }}>Correo electrónico *</label>
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
              <label htmlFor="password" style={{ fontWeight: '600', color: '#555', fontSize: '1rem' }}>Contraseña *</label>
              <input
                id="password"
                type="password"
                name="password"
                required
                minLength={6}
                style={{ width: '100%', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', boxSizing: 'border-box', backgroundColor: '#f9f9f9' }}
              />
            </div>

            {/* Teléfono */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              <label htmlFor="telefono" style={{ fontWeight: '600', color: '#555', fontSize: '1rem' }}>Número de Teléfono / WhatsApp (12 dígitos) *</label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                placeholder="Ej: 543451112222"
                required
                pattern="[0-9]{12}"
                title="Debe tener exactamente 12 números. Ejemplo: 543451112222"
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
                {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
              </button>
            </div>
            
            {/* Redirección a Login */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '1.05rem', color: '#555' }}>
              ¿Tenés una cuenta? <Link to="/login" style={{ color: '#e60000', fontWeight: 'bold', textDecoration: 'none' }}>Iniciá sesión</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default Register;
