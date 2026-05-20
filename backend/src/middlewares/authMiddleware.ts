import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos la interfaz Request de Express para inyectarle la propiedad 'user'
export interface AuthRequest extends Request {
  user?: any;
}

// 1. Middleware para Verificar que el usuario ha iniciado sesión
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // El token normalmente viaja oculto en los Headers HTTP como "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token válido o no has iniciado sesión.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // jwt.verify comprueba matemáticamente que el token no ha sido alterado y no ha caducado
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Si es válido, extraemos la info (id, rol) y la guardamos en la petición
    req.user = decoded; 
    
    next(); // Le decimos a Express: "Todo en orden, continúa a la función del controlador"
  } catch (error) {
    res.status(403).json({ message: 'Token de seguridad inválido o ha expirado.' });
  }
};

// 2. Middleware dinámico para Proteger rutas según el ROL
export const requireRole = (rolesPermitidos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Comprobamos si el rol del usuario actual está dentro de la lista de roles permitidos para esta acción
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      res.status(403).json({ message: 'Acceso prohibido. Tu cuenta no tiene el nivel de permisos necesario.' });
      return;
    }
    next(); // Si su rol está autorizado, avanza
  };
};
