import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Creamos un Pool de conexiones en lugar de una conexión individual.
// Esto es VITAL para evitar saturar el límite de 75 conexiones de Hostinger.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'expotextil',
  waitForConnections: true,
  connectionLimit: 50, // Reservamos 25 conexiones para phpMyAdmin o procesos internos
  queueLimit: 0
});

export default pool;
