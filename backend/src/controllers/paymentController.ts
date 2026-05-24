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
  const { standId, detalles } = req.body;
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
      'INSERT INTO compras_stands (usuario_id, stand_id, detalles_adicionales, estado) VALUES (?, ?, ?, ?)',
      [userId, standId, detalles || '', 'pendiente']
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
            title: stand.nombre,
            quantity: 1,
            unit_price: Number(stand.precio),
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
        auto_return: 'approved',
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
