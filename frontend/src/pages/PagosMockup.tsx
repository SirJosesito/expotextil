import React, { useState, useEffect } from 'react';

// Interfaz para los stands que vienen de la Base de Datos
interface Stand {
  id: string;
  nombre: string;
  dimensiones: string;
  precio: number;
  stock_disponible: number;
  descripcion: string;
}

const PagosMockup: React.FC = () => {
  const [selectedStandId, setSelectedStandId] = useState<string | null>(null);
  const [detalles, setDetalles] = useState('');
  const [stands, setStands] = useState<Stand[]>([]);
  const [loadingStands, setLoadingStands] = useState(true);

  // Cargar inventario real desde el Backend al abrir la página
  useEffect(() => {
    const fetchStands = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/payments/stands');
        if (response.ok) {
          const data = await response.json();
          setStands(data);
        }
      } catch (error) {
        console.error("Error al cargar los stands:", error);
      } finally {
        setLoadingStands(false);
      }
    };
    fetchStands();
  }, []);

  const selectedStand = stands.find(s => s.id === selectedStandId);

  const handleCheckout = async () => {
    if (!selectedStand) {
      alert("Por favor selecciona un stand primero.");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Debes iniciar sesión para poder adquirir un stand.");
        // Aquí podríamos redirigir al /login
        return;
      }

      const response = await fetch('http://localhost:3000/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Llave del guardaespaldas
        },
        body: JSON.stringify({
          standId: selectedStand.id,
          detalles: detalles
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al conectar con la pasarela de pagos');
      }

      // Redirigimos al usuario a la página oficial de MercadoPago
      window.location.href = data.init_point;

    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <main style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      minHeight: '80vh',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #eaeaea',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* COLUMNA IZQUIERDA: Selección de Stand (65%) */}
      <section className="resp-full-width resp-padding" style={{ 
        flex: '1 1 60%', 
        padding: '3rem 10%', 
        boxSizing: 'border-box'
      }}>
        
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#111', margin: '0 0 0.5rem 0' }}>Elige tu Stand</h2>
          <p style={{ color: '#666', margin: 0 }}>Selecciona el espacio que mejor se adapte a las necesidades de tu empresa.</p>
        </div>

        {/* Grilla de Stands */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          {loadingStands ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Cargando inventario en tiempo real...</div>
          ) : (
            stands.map((stand) => {
              const isAgotado = stand.stock_disponible <= 0;
              const isSelected = selectedStandId === stand.id;

              return (
                <div 
                  key={stand.id}
                  onClick={() => !isAgotado && setSelectedStandId(stand.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    border: isSelected ? '2px solid #e60000' : '1px solid #d9d9d9',
                    borderRadius: '12px',
                    backgroundColor: isAgotado ? '#f5f5f5' : (isSelected ? '#fffafa' : '#ffffff'),
                    cursor: isAgotado ? 'not-allowed' : 'pointer',
                    opacity: isAgotado ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(230,0,0,0.1)' : 'none'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: isAgotado ? '#888' : '#111' }}>{stand.nombre}</h3>
                      <span style={{ 
                        backgroundColor: isAgotado ? '#e0e0e0' : (stand.stock_disponible <= 5 ? '#ffebee' : '#e8f5e9'),
                        color: isAgotado ? '#555' : (stand.stock_disponible <= 5 ? '#c62828' : '#2e7d32'),
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {isAgotado ? 'AGOTADO' : `Quedan ${stand.stock_disponible} cupos`}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 0.3rem 0', color: '#555', fontSize: '0.95rem' }}>{stand.descripcion}</p>
                    <p style={{ margin: 0, color: '#333', fontWeight: '500', fontSize: '0.9rem' }}>Dimensiones: {stand.dimensiones}</p>
                  </div>

                  <div style={{ textAlign: 'right', marginLeft: '2rem' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isAgotado ? '#888' : '#111' }}>
                      ${Number(stand.precio).toLocaleString('es-AR')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#777' }}>ARS</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detalles Adicionales */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '1rem', margin: 0 }}>Requerimientos Adicionales</h2>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.8rem' }}>¿Necesitas conexión eléctrica trifásica, agua, o tienes alguna consulta sobre la ubicación?</p>
          <textarea 
            rows={4}
            placeholder="Escribe aquí tus requerimientos..."
            value={detalles}
            onChange={(e) => setDetalles(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #d9d9d9',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

      </section>

      {/* COLUMNA DERECHA: Resumen de Pedido (35%) */}
      <aside className="resp-full-width resp-padding" style={{ 
        flex: '1 1 35%', 
        padding: '3rem 5%', 
        backgroundColor: '#f8f9fa', 
        borderLeft: '1px solid #e1e4e8',
        boxSizing: 'border-box'
      }}>
        
        <h2 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '2rem' }}>Resumen de Compra</h2>

        {selectedStand ? (
          <>
            {/* Producto Seleccionado */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: '65px', 
                height: '65px', 
                backgroundColor: '#ffffff', 
                border: '2px solid #e60000',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}>
                <span style={{ color: '#e60000', fontWeight: 'bold', fontSize: '1.5rem' }}>
                  {selectedStand.nombre.charAt(6)} {/* Primera letra de Basico/Estandar/Industrial */}
                </span>
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#333',
                  color: 'white',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>1</div>
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', color: '#333' }}>{selectedStand.nombre}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{selectedStand.dimensiones}</p>
              </div>
              
              <div style={{ fontWeight: '600', color: '#111', fontSize: '1rem' }}>
                ${Number(selectedStand.precio).toLocaleString('es-AR')}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingBottom: '2rem', borderBottom: '1px solid #d1d5db', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '0.95rem' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: '500' }}>${Number(selectedStand.precio).toLocaleString('es-AR')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '0.95rem' }}>
                <span>Cargos de MercadoPago</span>
                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>Bonificados</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '1.2rem', color: '#333', fontWeight: 'bold' }}>Total</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#777' }}>ARS</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#111' }}>${Number(selectedStand.precio).toLocaleString('es-AR')}</span>
              </div>
            </div>
            


            <button 
              onClick={handleCheckout}
              style={{
                width: '100%',
                padding: '1.2rem',
                backgroundColor: '#009ee3', // Azul MercadoPago
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0084c1'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#009ee3'}
            >
              Pagar con Mercado Pago
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#888' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" style={{ marginBottom: '1rem' }}>
              <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Selecciona un stand a la izquierda para ver el resumen de compra y proceder al pago.</p>
          </div>
        )}

      </aside>
    </main>
  );
};

export default PagosMockup;
