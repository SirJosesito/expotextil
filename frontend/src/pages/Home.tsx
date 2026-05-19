import React from 'react';
import imgTextil1 from '../assets/textil.png';
import imgTextil2 from '../assets/textil2.png';
import imgTextil3 from '../assets/textil3.png';
import imgTextil4 from '../assets/textil4.png';

const Home: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // Imágenes de muestra relacionadas con textiles/expo
  const heroImages = [
    "https://images.pexels.com/photos/6717035/pexels-photo-6717035.jpeg?_gl=1*8bv341*_ga*ODA2NTkzNDIzLjE3NzkxMjA5Mjc.*_ga_8JE65Q40S6*czE3NzkxMjA5MjckbzEkZzEkdDE3NzkxMjY2MTMkajU5JGwwJGgw",
    imgTextil1,
    imgTextil2,
    imgTextil3,
    imgTextil4
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000); // Cambia de foto cada 4 segundos
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <main style={{ padding: '0', textAlign: 'center', backgroundColor: '#fafafa' }}>
      
      {/* Sección Hero */}
      <section className="resp-hero" style={{ 
        position: 'relative',
        backgroundColor: '#111',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url("https://i.ytimg.com/vi/6ZXYAP5YnQw/maxresdefault.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '14.6rem 7%', 
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '80vh',
        borderBottom: '1px solid #333',
        gap: '3rem'
      }}>
        
        {/* Lado Izquierdo: Textos */}
        <div className="resp-full-width resp-center-text" style={{ flex: '1 1 55%', textAlign: 'left', minWidth: '300px' }}>
          {/* Logo superior */}
          <div style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px' }}>
            <span style={{ color: '#ff0000' }}>EXPO</span> TEXTIL <br/> CONCORDIA
          </div>

          <h1 className="resp-hero-title" style={{ fontSize: '4.5rem', color: '#ffffff', margin: '0 0 1rem 0', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1.1' }}>
            EXPO TEXTIL<br/>GRÁFICA 2026
          </h1>
          <p className="resp-hero-subtitle" style={{ fontSize: '1.3rem', color: '#cccccc', fontWeight: '400', marginBottom: '2.5rem', maxWidth: '600px' }}>
            26 y 27 de Septiembre · Centro de Convenciones Concordia
          </p>
          
          <a 
            href="https://www.instagram.com/expotextilgrafica2026/" 
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: '#ff0000',
              color: '#ffffff',
              padding: '1rem 2.5rem',
              borderRadius: '30px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(255, 0, 0, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#cc0000';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ff0000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Instagram Oficial
          </a>
        </div>

        {/* Lado Derecho: Diapositiva de Fotos */}
        <div className="resp-full-width" style={{ flex: '1 1 35%', minWidth: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="resp-carousel" style={{
            width: '100%',
            height: '400px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            position: 'relative',
            border: '1.5px solid rgba(255, 255, 255, 0.1)'
          }}>
            {heroImages.map((src, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: currentImageIndex === index ? 1 : 0,
                  // transform: currentImageIndex === index ? 'scale(1.05)' : 'scale(1)', // Ligero efecto de zoom dinámico
                  transition: 'opacity 1s ease-in-out, transform 4s linear'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Espacios para rellenar información (Tarjetas) */}
      <section className="resp-cards" style={{ 
        display: 'flex', 
        gap: '2rem', 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        padding: '5rem 2rem',
        backgroundColor: '#fafafa',
        borderBottom: '1px solid #eaeaea'
      }}>
        <div className="resp-flex-col" style={{ maxWidth: '1200px', display: 'flex', gap: '2rem', flexWrap: 'wrap', width: '100%' }}>
          <div className="resp-full-width" style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '16px', flex: '1', minWidth: '300px', textAlign: 'left', borderTop: '4px solid #ff0000', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#333333', marginTop: 0, fontSize: '1.5rem' }}>¿Qué es la Expo?</h2>
            <p style={{ color: '#666666', lineHeight: '1.6' }}>
              Lorem ipsum dolor sit amet consectetur adipiscing elit commodo nam, gravida class dictum penatibus arcu conubia libero bibendum at sociosqu, euismod aptent nisl posuere in dapibus suscipit ultricies. Eget molestie iaculis vehicula facilisis placerat cursus, nam vel orci varius a faucibus in, diam elementum malesuada nisi semper. Ut laoreet facilisi malesuada interdum porttitor ultrices nunc conubia egestas, maecenas congue mollis id feugiat auctor mattis lacus quis, sociis libero faucibus ante cursus netus natoque aliquet.
            </p>
          </div>

          <div className="resp-full-width" style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '16px', flex: '1', minWidth: '300px', textAlign: 'left', borderTop: '4px solid #ff0000', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#333333', marginTop: 0, fontSize: '1.5rem' }}>¿Por qué participar?</h2>
            <p style={{ color: '#666666', lineHeight: '1.6' }}>
              Lorem ipsum dolor sit amet consectetur adipiscing elit commodo nam, gravida class dictum penatibus arcu conubia libero bibendum at sociosqu, euismod aptent nisl posuere in dapibus suscipit ultricies. Eget molestie iaculis vehicula facilisis placerat cursus, nam vel orci varius a faucibus in, diam elementum malesuada nisi semper. Ut laoreet facilisi malesuada interdum porttitor ultrices nunc conubia egestas, maecenas congue mollis id feugiat auctor mattis lacus quis, sociis libero faucibus ante cursus netus natoque aliquet.
            </p>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '16px', flex: '1', minWidth: '300px', textAlign: 'left', borderTop: '4px solid #ff0000', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#333333', marginTop: 0, fontSize: '1.5rem' }}>Rubros que participan</h2>
            <p style={{ color: '#666666', lineHeight: '1.6' }}>
              Lorem ipsum dolor sit amet consectetur adipiscing elit commodo nam, gravida class dictum penatibus arcu conubia libero bibendum at sociosqu, euismod aptent nisl posuere in dapibus suscipit ultricies. Eget molestie iaculis vehicula facilisis placerat cursus, nam vel orci varius a faucibus in, diam elementum malesuada nisi semper. Ut laoreet facilisi malesuada interdum porttitor ultrices nunc conubia egestas, maecenas congue mollis id feugiat auctor mattis lacus quis, sociis libero faucibus ante cursus netus natoque aliquet.
            </p>
          </div>
        </div>
      </section>

      {/* Sección Mapa */}
      <section className="resp-padding" style={{
        backgroundColor: '#ffffff',
        padding: '5rem 2rem'
      }}>
        <h2 style={{ fontSize: '2.5rem', color: '#000000ff', margin: '0 0 0.5rem 0', fontWeight: 'bold' , textDecoration: 'underline red 2px' , textUnderlineOffset: '10px'}}>Centro de Convenciones Concordia</h2>
        <p style={{ fontSize: '1.1rem', color: '#666666', marginBottom: '3rem' }}>
          San Lorenzo Oeste 101 · Concordia · Entre Ríos
        </p>

        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #cccccc'
        }}>
          {/* Reemplazar src con el mapa real cuando se necesite */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3406.0770411171916!2d-58.02063992374097!3d-31.384439174276473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95ade819f980ab2f%3A0x1c286421f93aa1c7!2sCentro%20de%20Convenciones%20Concordia!5e0!3m2!1ses!2sar!4v1779113907564!5m2!1ses!2sar" 
            width="100%" 
            height="450" 
            style={{ border: 0, display: 'block' }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa Centro de Convenciones"
          ></iframe>
        </div>
      </section>
    </main>
  );
};

export default Home;
