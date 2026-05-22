import { Router } from 'express';
import { createPreference, getStands } from '../controllers/paymentController';
import { receiveWebhook } from '../controllers/webhookController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

// 1. Endpoint protegido: El Frontend lo llama para generar el link de pago
// Solo los usuarios que tienen un token válido (iniciaron sesión) pueden usarlo
router.post('/create-preference', verifyToken, createPreference);

// 2. Endpoint público (Webhook): MercadoPago lo llamará cuando el pago se apruebe/rechace
// ¡IMPORTANTE! Este endpoint NO usa verifyToken porque es MercadoPago quien lo llama, no el usuario.
router.post('/webhook', receiveWebhook);

// 3. Endpoint público para obtener el inventario de stands (Para la Tienda)
router.get('/stands', getStands);

export default router;
