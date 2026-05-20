import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear el body a JSON

// Rutas base
app.use('/api/auth', authRoutes);
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
