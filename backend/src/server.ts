import dotenv from '@dotenvx/dotenvx';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import paymentRoutes from './routes/paymentRoutes';
import pool from './config/db';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear el body a JSON

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend de Expo Textil funcionando correctamente con Node.js.' 
  });
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo de forma segura en el puerto ${PORT}`);
});

// =========================================================
// TAREA EN SEGUNDO PLANO: Liberador de Stock (Carritos abandonados)
// =========================================================
// Se ejecuta cada 5 minutos
setInterval(async () => {
  try {
    // Buscar reservas 'pendientes' que tengan más de 15 minutos de antigüedad
    const [comprasExpiradas] = await pool.query<any>(`
      SELECT id, stand_id FROM compras_stands 
      WHERE estado = 'pendiente' AND created_at < (NOW() - INTERVAL 15 MINUTE)
    `);

    if (comprasExpiradas.length > 0) {
      console.log(`[Liberador de Stock] Devolviendo ${comprasExpiradas.length} stands abandonados al inventario...`);
      
      for (const compra of comprasExpiradas) {
        // 1. Marcar la orden como expirada
        await pool.query("UPDATE compras_stands SET estado = 'expirado' WHERE id = ?", [compra.id]);
        
        // 2. Devolver 1 cupo al stand
        await pool.query("UPDATE stands SET stock_disponible = stock_disponible + 1 WHERE id = ?", [compra.stand_id]);
      }
    }
  } catch (error) {
    console.error('[Liberador de Stock] Error:', error);
  }
}, 5 * 60 * 1000); // 5 minutos en milisegundos
