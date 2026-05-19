import React from 'react';

const Registro: React.FC = () => {
  const [registroExitoso, setRegistroExitoso] = React.useState(false);

  // Tipamos el evento para TypeScript
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Extraemos los datos del formulario usando FormData
    const formData = new FormData(e.currentTarget);
    const empresa = formData.get('empresa');
    const nombre = formData.get('nombre');
    const correo = formData.get('correo');
    const telefono = formData.get('telefono');
    const tipoStand = formData.get('tipo_stand');

    // Formateamos el string exactamente como lo pediste para la Base de Datos
    // "empresa; Nombre completo, correo, teléfono, tipo de stand (1, 2, 3)"
    const datosBDD = `${empresa}; ${nombre}, ${correo}, ${telefono}, ${tipoStand}`;

    // Imprimimos en consola
    console.log("=== DATOS CAPTURADOS PARA BDD ===");
    console.log(datosBDD);
    console.log("=================================");

    // Mostramos el popup de éxito visual
    setRegistroExitoso(true);
  };

  return (
    <main style={{ padding: '1rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#111111' }}>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#ffffff', fontSize: '3rem', marginBottom: '0.5rem', fontWeight: '900' }}>Inscripción de Expositores</h1>
        <p style={{ color: '#cccccc', fontSize: '1.2rem' }}>Completá el formulario para reservar tu stand en la Expo Textil Gráfica 2026</p>
      </div>

      <div style={{
        backgroundColor: '#ffffff', padding: '4rem', borderRadius: '24px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.4)', width: '100%',
        maxWidth: '900px', borderTop: '6px solid #ff0000'
      }}>

        {registroExitoso ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '5rem', color: '#4caf50', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ color: '#2e7d32', marginBottom: '1rem', fontSize: '2rem' }}>¡Registro Exitoso!</h2>
            <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Hemos recibido tus datos correctamente. A la brevedad nos pondremos en contacto para continuar con la gestión.
            </p>
            <button
              onClick={() => setRegistroExitoso(false)}
              style={{
                backgroundColor: '#f06292', color: 'white', border: 'none',
                padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem'
              }}
            >
              Enviar otra inscripción
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.20rem' }}>

            {/* Empresa */}
            <div>
              <input
                type="text"
                name="empresa"
                placeholder="Nombre de la empresa"
                required
                style={{ width: '100%', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', boxSizing: 'border-box', backgroundColor: '#f9f9f9' }}
              />
            </div>

            {/* Nombre */}
            <div>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre y apellido del responsable"
                required
                style={{ width: '100%', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', boxSizing: 'border-box', backgroundColor: '#f9f9f9' }}
              />
            </div>

            {/* Correo */}
            <div>
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                required
                style={{ width: '100%', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', boxSizing: 'border-box', backgroundColor: '#f9f9f9' }}
              />
            </div>

            {/* Teléfono */}
            <div>
              <input
                type="tel"
                name="telefono"
                placeholder="Número de WhatsApp"
                required
                style={{ width: '100%', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', boxSizing: 'border-box', backgroundColor: '#f9f9f9' }}
              />
            </div>

            {/* Tipo Stand */}
            <div>
              <select
                name="tipo_stand"
                required
                defaultValue=""
                style={{ width: '100%', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', boxSizing: 'border-box', backgroundColor: '#f9f9f9', color: '#555' }}
              >
                <option value="" disabled>Seleccionar tipo de stand</option>
                <option value="1">Stand Categoría A (3x3m)</option>
                <option value="2">Stand Categoría B (4x4m)</option>
                <option value="3">Isla VIP Central</option>
              </select>
            </div>

            {/* Comentarios */}
            <div>
              <textarea
                name="comentarios"
                placeholder="¿Tienes algún requerimiento especial para tu stand?"
                rows={4}
                style={{ width: '100%', padding: '16px 20px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.05rem', boxSizing: 'border-box', backgroundColor: '#f9f9f9', resize: 'vertical' }}
              ></textarea>
            </div>

            {/* Botón */}
            <div style={{ marginTop: '1rem' }}>
              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#e60000', color: 'white', border: 'none', padding: '18px',
                  borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                  textTransform: 'uppercase', transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cc0000'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e60000'}
              >
                ENVIAR FORMULARIO
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default Registro;
