import React from 'react';

const PagosMockup: React.FC = () => {
  return (
    <main style={{ 
      display: 'flex', 
      flexWrap: 'wrap', // Permite que en celulares se apilen las columnas
      minHeight: '80vh',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #eaeaea',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* COLUMNA IZQUIERDA: Formulario (65%) */}
      <section style={{ 
        flex: '1 1 60%', 
        padding: '3rem 10%', // Padding lateral dinámico
        boxSizing: 'border-box'
      }}>
        
        {/* Contacto */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#333', margin: 0 }}>Contacto</h2>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #d9d9d9', borderRadius: '8px', color: '#555', backgroundColor: '#fafafa' }}>
            <span style={{ fontWeight: '500' }}>empresa@email.com</span>
          </div>
        </div>

        {/* Datos de Facturación (Reemplaza al "Envío" de Nestlé) */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '1rem', margin: 0 }}>Datos de Facturación</h2>
          <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderBottom: '1px solid #d9d9d9' }}>
              <span style={{ color: '#777', fontSize: '0.9rem' }}>Facturar a</span>
              <span style={{ fontWeight: '500', color: '#333' }}>Empresa Textil S.A.</span>
              <span style={{ color: '#555', fontSize: '0.9rem' }}>CUIT: 30-12345678-9</span>
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', backgroundColor: '#fafafa' }}>
              <span style={{ color: '#777', fontSize: '0.9rem' }}>Dirección fiscal</span>
              <span style={{ color: '#333', fontSize: '0.9rem' }}>San Lorenzo Oeste 101, 3200 Concordia, Entre Ríos, AR</span>
            </div>
          </div>
        </div>

        {/* Checkboxes de Términos (Similar a Nestlé) */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#555' }}>
          <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" style={{ marginTop: '3px', width: '16px', height: '16px' }} />
            <span>Acepto recibir información y promociones por parte de la organización de Expo Textil.</span>
          </label>
          <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" style={{ marginTop: '3px', width: '16px', height: '16px' }} />
            <span>Declaro que represento a una empresa/emprendimiento y acepto los <a href="#" style={{ color: '#3f51b5' }}>Términos y Condiciones</a> de participación.</span>
          </label>
        </div>

        {/* Sección de Pago */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#333', marginBottom: '0.5rem' }}>Pago</h2>
          <p style={{ fontSize: '0.85rem', color: '#777', marginBottom: '1rem' }}>
            Todas las transacciones son seguras y están encriptadas.
          </p>
          
          <div style={{ border: '1px solid #3f51b5', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Cabecera Mercado Pago */}
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8eaf6', borderBottom: '1px solid #d9d9d9' }}>
              <span style={{ fontWeight: '600', color: '#1a237e' }}>Mercado Pago</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '35px', height: '22px', backgroundColor: '#009ee3', borderRadius: '4px', border: '1px solid #ccc' }}></div>
                <div style={{ width: '35px', height: '22px', backgroundColor: '#142c8e', borderRadius: '4px', border: '1px solid #ccc' }}></div>
                <div style={{ width: '35px', height: '22px', backgroundColor: '#eb001b', borderRadius: '4px', border: '1px solid #ccc' }}></div>
              </div>
            </div>
            {/* Cuerpo Mercado Pago */}
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', backgroundColor: '#fafafa', color: '#555', fontSize: '0.95rem' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" style={{ marginBottom: '10px' }}>
                <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <br/>
              Se te redirigirá a Mercado Pago para que completes la compra.
            </div>
          </div>
        </div>

        {/* Botón Pagar Ahora */}
        <button style={{
          width: '100%',
          padding: '1.2rem',
          backgroundColor: '#424242', // Gris carbón muy sobrio y serio
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#212121'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#424242'}
        >
          Pagar ahora
        </button>
      </section>

      {/* COLUMNA DERECHA: Resumen de Pedido (35%) */}
      <aside style={{ 
        flex: '1 1 35%', 
        padding: '3rem 5%', 
        backgroundColor: '#f0f4f8', // Azul-grisáceo pastel muy sutil y serio
        borderLeft: '1px solid #e1e4e8',
        boxSizing: 'border-box'
      }}>
        
        {/* Producto (Stand) */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
          {/* Imagen / Ícono del producto */}
          <div style={{ 
            width: '65px', 
            height: '65px', 
            backgroundColor: '#ffffff', 
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <span style={{ color: '#3f51b5', fontWeight: 'bold', fontSize: '1.5rem' }}>A</span>
            {/* Burbuja de cantidad (El '1' que tiene Nestlé arriba a la derecha) */}
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#555',
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
          
          {/* Detalles del Stand */}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem', color: '#333' }}>Stand Categoría A (3x3m)</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Espacio central para marcas</p>
          </div>
          
          {/* Precio Unitario */}
          <div style={{ fontWeight: '500', color: '#333', fontSize: '0.95rem' }}>
            $ 50.000,00
          </div>
        </div>

        {/* Input de Descuento (Para dar más realismo de e-commerce) */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #d1d5db', paddingBottom: '2rem' }}>
          <input 
            type="text" 
            placeholder="Código de descuento" 
            style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
          />
          <button style={{ padding: '0.8rem 1.5rem', backgroundColor: '#e2e8f0', color: '#555', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
            Aplicar
          </button>
        </div>

        {/* Subtotales y Total */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '0.95rem' }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: '500' }}>$ 50.000,00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '0.95rem' }}>
            <span>Costo de servicio</span>
            <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>GRATIS</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ fontSize: '1.2rem', color: '#333' }}>Total</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#777' }}>ARS</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>$ 50.000,00</span>
            </div>
          </div>
          
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#777' }}>
            Incluye $ 8.677,68 de impuestos (IVA)
          </div>
        </div>

      </aside>
    </main>
  );
};

export default PagosMockup;
