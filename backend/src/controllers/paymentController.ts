import { Request, Response } from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middlewares/authMiddleware';

// Inicializar cliente de MercadoPago (Token vendrá de .envx)
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-TOKEN' });

// Endpoint público para que el Frontend consulte los stands disponibles
export const getStands = async (req: Request, res: Response): Promise<void> => {
  try {
    const [stands] = await pool.query('SELECT * FROM stands');
    res.status(200).json(stands);
  } catch (error) {
    console.error('Error al consultar inventario de stands:', error);
    res.status(500).json({ message: 'Error interno del servidor al consultar stands.' });
  }
};

export const createPreference = async (req: AuthRequest, res: Response): Promise<void> => {
  const { standId, detalles, tipoPago: rawTipoPago } = req.body;
  const tipoPago = (rawTipoPago === 'seña') ? 'seña' : 'completo';
  const userId = req.user.id;
  const userEmail = req.user.email;

  // Iniciamos una conexión dedicada para la Transacción
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Bloqueo de fila para evitar Race Conditions (Evitar que dos compren el último)
    const [stands] = await connection.query<RowDataPacket[]>(
      'SELECT id, nombre, precio, stock_disponible FROM stands WHERE id = ? FOR UPDATE',
      [standId]
    );

    if (stands.length === 0) {
      throw new Error('El stand solicitado no existe.');
    }

    const stand = stands[0];

    // 2. Verificar Stock
    if (stand.stock_disponible <= 0) {
      throw new Error('Lamentamos informarte que este stand se acaba de agotar.');
    }

    // 3. Crear el registro "pendiente" en compras_stands
    const [insertResult] = await connection.query<ResultSetHeader>(
      'INSERT INTO compras_stands (usuario_id, stand_id, detalles_adicionales, estado, tipo_pago, saldo_pagado, monto_pagado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, standId, detalles || '', 'pendiente', tipoPago, 0, 0.00]
    );

    const compraId = insertResult.insertId;

    // Detectar si el usuario viene de un Dev Tunnel o de localhost
    const frontendUrl = req.headers.origin || 'http://localhost:5173';

    // 4. Configurar la Preferencia de MercadoPago
    const preference = new Preference(client);
    
    // El Back_URL es a dónde vuelve el usuario tras pagar. 
    // El Notification_URL es nuestro Webhook invisible.
    const result = await preference.create({
      body: {
        items: [
          {
            id: stand.id,
            title: stand.nombre + (tipoPago === 'seña' ? ' (Seña 50%)' : ''),
            quantity: 1,
            unit_price: tipoPago === 'seña' ? Number(stand.precio) / 2 : Number(stand.precio),
            currency_id: 'ARS'
          }
        ],
        payer: {
          email: userEmail
        },
        back_urls: {
          success: `${frontendUrl}/checkout/exito`,
          failure: `${frontendUrl}/checkout/fallo`,
          pending: `${frontendUrl}/checkout/pendiente`
        },
        auto_return: frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1') ? undefined : 'approved',
        notification_url: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/payments/webhook` : undefined,
        external_reference: compraId.toString(),
        expires: true,
        expiration_date_to: new Date(Date.now() + 15 * 60000).toISOString() // El link expira en 15 minutos
      }
    });

    // 5. Restar el stock provisionalmente
    await connection.query(
      'UPDATE stands SET stock_disponible = stock_disponible - 1 WHERE id = ?',
      [standId]
    );

    // Si todo salió bien, confirmamos la transacción SQL
    await connection.commit();

    // Devolvemos el link de pago al Frontend
    res.status(200).json({ 
      id: result.id,
      init_point: result.init_point // URL a donde debe redirigirse el usuario
    });

  } catch (error: any) {
    // Si ALGO falló, cancelamos todo y nadie pierde su dinero ni su stock (Rollback)
    await connection.rollback();
    console.error('Error al generar la preferencia de pago:', error);
    res.status(400).json({ message: error.message || 'Error interno al procesar el pago.' });
  } finally {
    // Liberamos la conexión para que otros usuarios la usen
    connection.release();
  }
};

export const payBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { compraId } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;

  try {
    // 1. Buscar la compra
    const [purchases] = await pool.query<RowDataPacket[]>(
      'SELECT c.*, s.nombre as stand_nombre, s.precio as stand_precio FROM compras_stands c INNER JOIN stands s ON c.stand_id = s.id WHERE c.id = ? AND c.usuario_id = ?',
      [compraId, userId]
    );

    if (purchases.length === 0) {
      res.status(404).json({ message: 'La reserva especificada no existe o no te pertenece.' });
      return;
    }

    const compra = purchases[0];

    // Verificar si realmente es de tipo seña y está aprobada, y si el saldo no ha sido pagado aún
    if (compra.tipo_pago !== 'seña') {
      res.status(400).json({ message: 'Esta compra no corresponde a una modalidad de Seña.' });
      return;
    }

    if (compra.estado !== 'aprobado') {
      res.status(400).json({ message: 'No puedes pagar el saldo si la seña inicial no está aprobada.' });
      return;
    }

    if (compra.saldo_pagado === 1) {
      res.status(400).json({ message: 'El saldo restante de esta reserva ya ha sido cancelado.' });
      return;
    }

    // 2. Calcular monto restante
    const montoRestante = Number(compra.stand_precio) / 2;

    const frontendUrl = req.headers.origin || 'http://localhost:5173';

    // 3. Crear preferencia de MercadoPago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: compra.stand_id,
            title: compra.stand_nombre + ' (Saldo Restante 50%)',
            quantity: 1,
            unit_price: montoRestante,
            currency_id: 'ARS'
          }
        ],
        payer: {
          email: userEmail
        },
        back_urls: {
          success: `${frontendUrl}/checkout/exito`,
          failure: `${frontendUrl}/checkout/fallo`,
          pending: `${frontendUrl}/checkout/pendiente`
        },
        auto_return: frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1') ? undefined : 'approved',
        notification_url: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/payments/webhook` : undefined,
        external_reference: 'saldo-' + compraId.toString(),
        expires: true,
        expiration_date_to: new Date(Date.now() + 15 * 60000).toISOString() // Expiración en 15 min
      }
    });

    res.status(200).json({
      id: result.id,
      init_point: result.init_point
    });

  } catch (error: any) {
    console.error('Error al generar la preferencia de saldo:', error);
    res.status(500).json({ message: error.message || 'Error interno del servidor al procesar saldo.' });
  }
};
