import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// Endpoint para registrar un nuevo usuario (visitante/expositor)
// POST /api/auth/register
router.post('/register', register);

// Endpoint para iniciar sesión y obtener el Token JWT
// POST /api/auth/login
router.post('/login', login);

export default router;
