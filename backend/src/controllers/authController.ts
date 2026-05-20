import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { empresa, nombre, email, telefono, password } = req.body;

    // 1. Verificar si el usuario ya existe
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
      return;
    }

    // 2. Encriptar la contraseña (hash)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Guardar el usuario en la base de datos
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO usuarios (empresa, nombre, email, telefono, password_hash) VALUES (?, ?, ?, ?, ?)',
      [empresa, nombre, email, telefono, passwordHash]
    );

    // 4. Generar el JWT
    const token = jwt.sign(
      { id: result.insertId, email, rol: 'registrado' }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '24h' }
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente.', token });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      res.status(401).json({ message: 'Credenciales inválidas.' });
      return;
    }

    const user = rows[0];

    // 2. Comparar contraseñas
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Credenciales inválidas.' });
      return;
    }

    // 3. Generar el JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '24h' }
    );

    res.status(200).json({ message: 'Inicio de sesión exitoso.', token, rol: user.rol });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
