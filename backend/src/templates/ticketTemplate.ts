export const ticketTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ticket Expo Textil</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    
    <!-- Encabezado -->
    <div style="background-color: #e60000; color: #ffffff; padding: 30px 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 1px;">¡Felicidades {{nombre}}!</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: 300;">Ya eres Expositor Oficial</p>
    </div>
    
    <!-- Cuerpo del Mensaje -->
    <div style="padding: 40px 30px; background-color: #fcfcfc;">
      <p style="font-size: 16px; color: #333; margin-top: 0;">Tu pago ha sido procesado y aprobado con éxito. A continuación, te presentamos los detalles oficiales de tu stand para la Expo Textil Gráfica y Creativa 2026:</p>
      
      <!-- Contenedor del Ticket -->
      <div style="background-color: #ffffff; border: 2px dashed #cccccc; padding: 25px; text-align: center; margin: 30px 0; border-radius: 8px;">
        <h2 style="margin: 0; color: #111111; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">{{stand_nombre}}</h2>
        
        <div style="margin: 20px 0; padding: 15px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
          <p style="color: #e60000; font-size: 18px; margin: 0; font-weight: bold;">Dimensiones: {{dimensiones}}</p>
        </div>
        
        <p style="color: #888888; font-size: 13px; margin: 0;">ID de Transacción: <strong>{{pago_id}}</strong></p>
      </div>

      <p style="font-size: 14px; color: #555555; line-height: 1.6;">Por favor, guarda este correo electrónico como tu comprobante de reserva. Nos pondremos en contacto contigo muy pronto para coordinar los horarios de armado y brindarte los detalles logísticos del evento.</p>
    </div>
    
    <!-- Pie de página -->
    <div style="background-color: #111111; color: #ffffff; padding: 20px; text-align: center; font-size: 13px;">
      <p style="margin: 0;"><strong>Expo Textil Gráfica y Creativa 2026</strong></p>
      <p style="margin: 5px 0 0 0; color: #aaaaaa;">Centro de Convenciones Concordia, Entre Ríos</p>
    </div>
  </div>
</body>
</html>
`;
