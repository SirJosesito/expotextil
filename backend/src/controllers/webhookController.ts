import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import pool from '../config/db';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-TOKEN' });

export const receiveWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // MercadoPago puede enviar el ID en el query o en el body dependiendo de la versión del webhook
    const paymentId = req.query.id || req.body?.data?.id;

    if (!paymentId) {
      res.status(400).send('No payment ID provided');
      return;
    }

    // 1. Consultar a MercadoPago el estado REAL del pago (Esto evita Inyecciones Falsas)
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: String(paymentId) });

    const estado = paymentData.status; // ej: 'approved', 'rejected', 'pending'
    const compraId = paymentData.external_reference; // El ID de nuestra tabla compras_stands

    if (!compraId) {
      res.status(200).send('Webhook OK (No external_reference)');
      return;
    }

    // 2. Actualizamos el estado de la compra en la base de datos
    await pool.query(
      'UPDATE compras_stands SET estado = ?, pago_id = ? WHERE id = ?',
      [estado, paymentId, compraId]
    );

    // 3. Lógica de negocio (Ascender usuario o Devolver Stock)
    if (estado === 'approved') {
      // Buscar quién era el usuario
      const [rows] = await pool.query<any>('SELECT usuario_id FROM compras_stands WHERE id = ?', [compraId]);
      if (rows.length > 0) {
        const usuarioId = rows[0].usuario_id;
        
        // ¡Magia! El usuario registrado ahora es EXPOSITOR
        await pool.query('UPDATE usuarios SET rol = ? WHERE id = ?', ['expositor', usuarioId]);
      }
    } 
    else if (estado === 'rejected' || estado === 'cancelled' || estado === 'refunded') {
      // Si el pago falló, debemos DEVOLVER el stock que le habíamos bloqueado a ese stand
      const [rows] = await pool.query<any>('SELECT stand_id FROM compras_stands WHERE id = ?', [compraId]);
      if (rows.length > 0) {
         await pool.query('UPDATE stands SET stock_disponible = stock_disponible + 1 WHERE id = ?', [rows[0].stand_id]);
      }
    }

    // 4. Respuesta obligatoria a MercadoPago
    // MP exige que le respondamos un código 200 rápido para que sepa que escuchamos su mensaje, de lo contrario lo reenviará eternamente
    res.status(200).send('Webhook Received successfully');
  } catch (error) {
    console.error('Error procesando el Webhook de MercadoPago:', error);
    res.status(500).send('Webhook processing error');
  }
};
