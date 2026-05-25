import { Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { AuthRequest } from '../middlewares/authMiddleware';

// Controlador para obtener los datos del propio usuario
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    // Buscamos los datos del usuario en la base de datos
    // MUY IMPORTANTE: Excluimos deliberadamente el campo 'password_hash' para nunca enviarlo a internet
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, empresa, nombre, email, telefono, rol, created_at FROM usuarios WHERE id = ?', 
      [userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    // Enviamos los datos limpios al Frontend
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Controlador restringido EXCLUSIVAMENTE para administradores
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Obtenemos a todos los usuarios del sistema (solo id, nombre, email y rol para no enviar data innecesaria)
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, empresa, nombre, email, rol FROM usuarios');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener la lista completa de usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Controlador para obtener el historial de compras y stands del usuario
export const getUserPurchases = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    // Hacemos un JOIN entre compras_stands y stands para devolver la información útil
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        c.id as compra_id,
        c.estado as estado_pago,
        c.pago_id,
        c.detalles_adicionales,
        c.created_at,
        c.tipo_pago,
        c.saldo_pagado,
        c.monto_pagado,
        s.nombre as stand_nombre,
        s.precio as stand_precio,
        s.dimensiones as metros_cuadrados
      FROM compras_stands c
      INNER JOIN stands s ON c.stand_id = s.id
      WHERE c.usuario_id = ?
      ORDER BY c.created_at DESC
    `, [userId]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener compras del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al consultar compras.' });
  }
};
