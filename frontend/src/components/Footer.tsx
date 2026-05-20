import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#0a0a0a',
      color: '#888888',
      padding: '2.5rem 1rem',
      textAlign: 'center',
      borderTop: '1px solid #222222',
      fontSize: '0.95rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <div>
        &copy; {new Date().getFullYear()} Expo Textil, Gráfica y Creativa Concordia. Todos los derechos reservados.
      </div>
      <div>
        Diseñado y desarrollado por <a href="https://github.com/jRoma-dev" target="_blank" rel="noreferrer" style={{ color: '#ffffff', fontWeight: 'bold', textDecoration: 'none' }}>jRoma-dev</a>
      </div>
    </footer>
  );
};

export default Footer;
