import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import pool from '../config/db';
import { Resend } from 'resend';
import handlebars from 'handlebars';
import { ticketTemplate } from '../templates/ticketTemplate';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-TOKEN' });

export const receiveWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // VALIDACION ID
    const paymentId = req.query.id || req.body?.data?.id;

    if (!paymentId) {
      res.status(400).send('No payment ID provided');
      return;
    }

    // CONSULTA MERCADO PAGO
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: String(paymentId) });

    const mpStatus = paymentData.status;
    
    // MAPEO ESTADOS
    let estado = 'pendiente';
    if (mpStatus === 'approved') {
      estado = 'aprobado';
    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled' || mpStatus === 'refunded') {
      estado = 'rechazado';
    }
    const compraId = paymentData.external_reference; // El ID de nuestra tabla compras_stands

    if (!compraId) {
      res.status(200).send('Webhook OK (No external_reference)');
      return;
    }

    // ACTUALIZAR ESTADO DB
    await pool.query(
      'UPDATE compras_stands SET estado = ?, pago_id = ? WHERE id = ?',
      [estado, paymentId, compraId]
    );

    // LOGICA DE NEGOCIO
    if (estado === 'aprobado') {
      // Buscar los detalles completos para el correo
      const [rows] = await pool.query<any>(`
        SELECT c.usuario_id, u.email, u.nombre, s.nombre as stand_nombre, s.dimensiones, c.pago_id 
        FROM compras_stands c
        INNER JOIN usuarios u ON c.usuario_id = u.id
        INNER JOIN stands s ON c.stand_id = s.id
        WHERE c.id = ?
      `, [compraId]);

      if (rows.length > 0) {
        const { usuario_id, email, nombre, stand_nombre, dimensiones, pago_id } = rows[0];
        
        await pool.query('UPDATE usuarios SET rol = ? WHERE id = ?', ['expositor', usuario_id]);

        // FUNCION CORREO
        if (process.env.RESEND_API_KEY) {
          try {
            // Leer y compilar la plantilla de Handlebars
            const compiledTemplate = handlebars.compile(ticketTemplate);
            
            // Inyectar las variables en la plantilla
            const htmlToSend = compiledTemplate({
              nombre: nombre,
              stand_nombre: stand_nombre,
              dimensiones: dimensiones,
              pago_id: pago_id || 'N/A'
            });

            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
              from: 'onboarding@resend.dev', // Resend Sandbox exige este correo exacto
              to: email, // El correo del cliente real
              subject: '🎟️ Tu Ticket Oficial - Expo Textil 2026',
              html: htmlToSend
            });

            if (error) {
              console.error('Error de Resend (Webhook Real):', error);
            } else {
              console.log(`Correo enviado con éxito a ${email}. ID:`, data?.id);
            }
          } catch (err) {
            console.error('Error interno al compilar/enviar el correo (Webhook Real):', err);
          }
        }
      }
    } 
    else if (estado === 'rechazado') {
      // DEVOLVER STOCK
      const [rows] = await pool.query<any>('SELECT stand_id FROM compras_stands WHERE id = ?', [compraId]);
      if (rows.length > 0) {
         await pool.query('UPDATE stands SET stock_disponible = stock_disponible + 1 WHERE id = ?', [rows[0].stand_id]);
      }
    }

    // RESPUESTA OBLIGATORIA MP
    res.status(200).send('Webhook Received successfully');
  } catch (error) {
    console.error('Error procesando el Webhook de MercadoPago:', error);
    res.status(500).send('Webhook processing error');
  }
};

// ========================================================
// ENDPOINT DESARROLLO (Testing Webhooks)
// ========================================================
export const simulateWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { compraId, estado: paramEstado } = req.body;

    if (!compraId || !paramEstado) {
      res.status(400).json({ message: 'Faltan parámetros requeridos: compraId y estado' });
      return;
    }

    // MAPEO SEGURO SIMULADOR
    let estado = 'pendiente';
    if (paramEstado === 'approved' || paramEstado === 'aprobado') estado = 'aprobado';
    if (paramEstado === 'rejected' || paramEstado === 'rechazado' || paramEstado === 'cancelled') estado = 'rechazado';

    // ACTUALIZAR ESTADO DB FALSO
    await pool.query(
      'UPDATE compras_stands SET estado = ?, pago_id = ? WHERE id = ?',
      [estado, 'SIMULACION-' + Date.now(), compraId]
    );

    // LOGICA DE NEGOCIO SIMULADOR
    if (estado === 'aprobado') {
      const [rows] = await pool.query<any>(`
        SELECT c.usuario_id, u.email, u.nombre, s.nombre as stand_nombre, s.dimensiones, c.pago_id 
        FROM compras_stands c
        INNER JOIN usuarios u ON c.usuario_id = u.id
        INNER JOIN stands s ON c.stand_id = s.id
        WHERE c.id = ?
      `, [compraId]);

      if (rows.length > 0) {
        const { usuario_id, email, nombre, stand_nombre, dimensiones, pago_id } = rows[0];
        await pool.query('UPDATE usuarios SET rol = ? WHERE id = ?', ['expositor', usuario_id]);

        // FUNCION CORREO SIMULADOR
        if (process.env.RESEND_API_KEY) {
          try {
            // Leer y compilar la plantilla de Handlebars
            const compiledTemplate = handlebars.compile(ticketTemplate);
            
            // Inyectar las variables en la plantilla
            const htmlToSend = compiledTemplate({
              nombre: nombre,
              stand_nombre: stand_nombre,
              dimensiones: dimensiones,
              pago_id: pago_id || 'N/A'
            });

            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
              from: 'Tickets Expo Textil <ventas@expotextilgrafica.com>', // Resend Sandbox exige este correo exacto
              to: email, // El correo del cliente que registró
              subject: '🎟️ Tu Ticket Oficial - Expo Textil 2026',
              html: htmlToSend
            });

            if (error) {
              console.error('Error de Resend (Simulador):', error);
            } else {
              console.log(`Correo Simulado enviado con éxito a ${email}. ID:`, data?.id);
            }
          } catch (err) {
            console.error('Error interno al compilar/enviar el correo (Simulador):', err);
          }
        }
      }
    } else if (estado === 'rechazado') {
      const [rows] = await pool.query<any>('SELECT stand_id FROM compras_stands WHERE id = ?', [compraId]);
      if (rows.length > 0) {
         await pool.query('UPDATE stands SET stock_disponible = stock_disponible + 1 WHERE id = ?', [rows[0].stand_id]);
      }
    }

    res.status(200).json({ message: `Webhook simulado procesado correctamente. Nueva orden #${compraId} -> ${estado}` });
  } catch (error) {
    console.error('Error en el simulador de Webhooks:', error);
    res.status(500).json({ message: 'Error interno simulando webhook' });
  }
};
