import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Purchase {
  compra_id: number;
  estado_pago: string;
  pago_id: string;
  detalles_adicionales: string;
  created_at: string;
  stand_nombre: string;
  stand_precio: number;
  metros_cuadrados: string;
  tipo_pago: 'completo' | 'seña';
  saldo_pagado: number;
  monto_pagado: number;
}

const Dashboard: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchases = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/users/purchases', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener el historial de compras');
        }

        const data = await response.json();
        setPurchases(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [navigate]);

  const handlePayBalance = async (compraId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Debes iniciar sesión para abonar el saldo.");
        return;
      }

      const response = await fetch('http://localhost:3000/api/payments/pay-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ compraId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar el saldo restante.');
      }

      // Redirigir a Mercado Pago
      window.location.href = data.init_point;
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <main style={{ padding: '4rem 2rem', backgroundColor: '#fafafa', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#111', fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '900' }}>Mi Panel</h1>
        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '3rem' }}>Historial de stands y reservas</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Cargando información...</div>
        ) : error ? (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1.5rem', borderRadius: '8px' }}>
            {error}
          </div>
        ) : purchases.length === 0 ? (
          <div style={{ textAlign: 'center', backgroundColor: '#fff', padding: '4rem', borderRadius: '16px', border: '1px solid #eaeaea', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '1rem' }}>No tienes ninguna reserva</h3>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Aún no has adquirido ningún stand para la expo.</p>
            <button 
              onClick={() => navigate('/checkout')} 
              style={{ 
                backgroundColor: '#e60000', 
                color: '#fff', 
                border: 'none', 
                padding: '12px 24px', 
                borderRadius: '30px', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cc0000'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e60000'}
            >
              Ver Stands Disponibles
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {purchases.map((p) => {
              const isApproved = p.estado_pago === 'aprobado';
              const isPending = p.estado_pago === 'pendiente';
              const esSeña = p.tipo_pago === 'seña';
              const saldoPendiente = esSeña && p.saldo_pagado === 0;
              
              let statusColor = '#c62828';
              let statusText = 'Rechazado / Expirado';
              let statusBg = '#ffebee';
              
              if (isApproved) {
                if (saldoPendiente) {
                  statusColor = '#f57f17';
                  statusText = 'Seña (50%) Abonada';
                  statusBg = '#fffde7';
                } else {
                  statusColor = '#2e7d32';
                  statusText = esSeña ? 'Abonado 100% (Completado)' : 'Aprobado (Expositor)';
                  statusBg = '#e8f5e9';
                }
              } else if (isPending) {
                statusColor = '#f57f17';
                statusText = 'Pendiente de Pago';
                statusBg = '#fffde7';
              }

              return (
                <div key={p.compra_id} style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#333' }}>{p.stand_nombre}</h3>
                      <span style={{ backgroundColor: statusBg, color: statusColor, padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {statusText}
                      </span>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <p style={{ margin: '0 0 0.8rem 0', color: '#555' }}><strong>Dimensiones:</strong> {p.metros_cuadrados}</p>
                      <p style={{ margin: '0 0 0.8rem 0', color: '#555' }}><strong>Precio Total:</strong> ${Number(p.stand_precio).toLocaleString('es-AR')} ARS</p>
                      
                      {isApproved && esSeña && (
                        <div style={{ backgroundColor: '#fafafa', padding: '0.8rem', borderRadius: '8px', marginBottom: '0.8rem', border: '1px solid #f0f0f0' }}>
                          <p style={{ margin: '0 0 0.4rem 0', color: '#555', fontSize: '0.9rem' }}>
                            <strong>Monto Abonado:</strong> ${Number(p.monto_pagado).toLocaleString('es-AR')} ARS
                          </p>
                          <p style={{ margin: 0, color: saldoPendiente ? '#e60000' : '#2e7d32', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            {saldoPendiente 
                              ? `Saldo Pendiente: $${(Number(p.stand_precio) - Number(p.monto_pagado)).toLocaleString('es-AR')} ARS`
                              : '✓ 100% Abonado'
                            }
                          </p>
                        </div>
                      )}

                      <p style={{ margin: '0 0 0.8rem 0', color: '#555', fontSize: '0.9rem' }}><strong>Fecha:</strong> {new Date(p.created_at).toLocaleDateString('es-AR')} {new Date(p.created_at).toLocaleTimeString('es-AR')}</p>
                      <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>ID Transacción: {p.pago_id || 'N/A'}</p>
                    </div>
                  </div>
                  {isApproved && (
                    <div style={{ backgroundColor: '#fafafa', padding: '1.2rem 1.5rem', borderTop: '1px solid #eaeaea' }}>
                      {saldoPendiente ? (
                        <div>
                          <div style={{ color: '#f57f17', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.6rem' }}>
                            ⚠️ Saldo pendiente (Límite: 24/09 inclusive)
                          </div>
                          <button
                            onClick={() => handlePayBalance(p.compra_id)}
                            style={{
                              width: '100%',
                              padding: '10px 16px',
                              backgroundColor: '#009ee3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '25px',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              boxShadow: '0 2px 5px rgba(0,158,227,0.2)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0084c1'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#009ee3'}
                          >
                             Pagar Saldo Restante (50%)
                          </button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            ✓ Stand 100% Completado. ¡Lugar Asegurado!
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
