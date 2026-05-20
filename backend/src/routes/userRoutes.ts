import { Router } from 'express';
import { getProfile, getAllUsers } from '../controllers/userController';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// RUTA 1: Ver el propio perfil
// GET /api/users/profile
// Cualquier usuario que tenga un token válido (es decir, inició sesión) puede consultar su perfil.
// El middleware "verifyToken" detendrá a quien no tenga llave.
router.get('/profile', verifyToken, getProfile);

// RUTA 2: Panel de control de Administrador
// GET /api/users/all
// Aquí aplicamos doble candado de seguridad:
// 1. Debe tener sesión iniciada (verifyToken)
// 2. Debe tener específicamente el rol de "admin" (requireRole)
router.get('/all', verifyToken, requireRole(['admin']), getAllUsers);

export default router;
