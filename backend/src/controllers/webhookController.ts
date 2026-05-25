import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import pool from '../config/db';
import { Resend } from 'resend';
import handlebars from 'handlebars';
import { ticketTemplate } from '../templates/ticketTemplate';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-TOKEN' });

export const receiveWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // VALIDACION ID
    const paymentId = req.query.id || req.body?.data?.id;

    if (!paymentId) {
      res.status(400).send('No payment ID provided');
      return;
    }

    // CONSULTA MERCADO PAGO
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: String(paymentId) });

    const mpStatus = paymentData.status;
    
    // MAPEO ESTADOS
    let estado = 'pendiente';
    if (mpStatus === 'approved') {
      estado = 'aprobado';
    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled' || mpStatus === 'refunded') {
      estado = 'rechazado';
    }

    const externalRef = paymentData.external_reference; // El ID de nuestra tabla compras_stands o saldo-compraId

    if (!externalRef) {
      res.status(200).send('Webhook OK (No external_reference)');
      return;
    }

    const isBalancePayment = String(externalRef).startsWith('saldo-');
    const compraId = isBalancePayment 
      ? Number(String(externalRef).replace('saldo-', ''))
      : Number(externalRef);

    // Obtener estado actual de la DB para evitar sobrescribir con webhooks duplicados o tardíos
    const [compraCheck] = await pool.query<any>('SELECT estado, saldo_pagado FROM compras_stands WHERE id = ?', [compraId]);
    const currentEstado = compraCheck.length > 0 ? compraCheck[0].estado : null;
    const currentSaldoPagado = compraCheck.length > 0 ? compraCheck[0].saldo_pagado : 0;

    let sendEmail = false;

    // ACTUALIZAR ESTADO DB REAL
    if (estado === 'aprobado') {
      if (isBalancePayment) {
        if (currentSaldoPagado === 0) {
          // Actualizar saldo pagado e incrementar monto pagado sumándole la mitad del precio del stand
          await pool.query(`
            UPDATE compras_stands c
            INNER JOIN stands s ON c.stand_id = s.id
            SET c.saldo_pagado = 1, c.monto_pagado = c.monto_pagado + (s.precio / 2)
            WHERE c.id = ?
          `, [compraId]);
          sendEmail = true;
        }
      } else {
        // Pago inicial (seña o completo)
        if (currentEstado !== 'aprobado') {
          // 1. Obtener la compra para saber si es seña o completo
          const [compraRows] = await pool.query<any>('SELECT tipo_pago, stand_id FROM compras_stands WHERE id = ?', [compraId]);
          if (compraRows.length > 0) {
            const { tipo_pago, stand_id } = compraRows[0];
            // 2. Obtener el precio del stand
            const [standRows] = await pool.query<any>('SELECT precio FROM stands WHERE id = ?', [stand_id]);
            const standPrecio = standRows.length > 0 ? Number(standRows[0].precio) : 0;
            
            const esSeña = tipo_pago === 'seña';
            const montoAPagar = esSeña ? (standPrecio / 2) : standPrecio;
            const saldoPagadoVal = esSeña ? 0 : 1;

            await pool.query(
              'UPDATE compras_stands SET estado = ?, pago_id = ?, saldo_pagado = ?, monto_pagado = ? WHERE id = ?',
              [estado, paymentId, saldoPagadoVal, montoAPagar, compraId]
            );
            sendEmail = true;
          }
        } else {
          // Si ya está aprobado, solo asociamos el pago_id por si no existía, pero no reiniciamos valores de seña
          await pool.query(
            'UPDATE compras_stands SET pago_id = COALESCE(pago_id, ?) WHERE id = ?',
            [paymentId, compraId]
          );
        }
      }
    } else {
      // Si fue rechazado/expirado y no estaba aprobado ya (no queremos degradar un stand aprobado por intentos fallidos de saldo o dobles transacciones)
      if (currentEstado !== 'aprobado') {
        await pool.query(
          'UPDATE compras_stands SET estado = ?, pago_id = ? WHERE id = ?',
          [estado, paymentId, compraId]
        );
      }
    }

    // LOGICA DE NEGOCIO REAL
    if (estado === 'aprobado' && sendEmail) {
      // Buscar los detalles completos para el correo
      const [rows] = await pool.query<any>(`
        SELECT c.usuario_id, u.email, u.nombre, s.nombre as stand_nombre, s.dimensiones, c.pago_id, c.tipo_pago, c.saldo_pagado
        FROM compras_stands c
        INNER JOIN usuarios u ON c.usuario_id = u.id
        INNER JOIN stands s ON c.stand_id = s.id
        WHERE c.id = ?
      `, [compraId]);

      if (rows.length > 0) {
        const { usuario_id, email, nombre, stand_nombre, dimensiones, pago_id, tipo_pago, saldo_pagado } = rows[0];
        
        await pool.query('UPDATE usuarios SET rol = ? WHERE id = ?', ['expositor', usuario_id]);

        // FUNCION CORREO REAL
        if (process.env.RESEND_API_KEY) {
          try {
            // Leer y compilar la plantilla de Handlebars
            const compiledTemplate = handlebars.compile(ticketTemplate);
            
            // Personalizar mensaje según modalidad
            let mensajeEspecial = '';
            if (isBalancePayment) {
              mensajeEspecial = `¡Tu pago de saldo restante ha sido aprobado con éxito! Tu stand ha quedado <strong>100% abonado y completado</strong>. A continuación, te presentamos los detalles oficiales de tu espacio:`;
            } else if (tipo_pago === 'seña') {
              mensajeEspecial = `¡Tu pago de seña ha sido aprobado con éxito! Tu stand ha quedado reservado bajo la modalidad de <strong>Seña (50%)</strong>. A continuación, te presentamos los detalles de tu espacio. Recuerda que tienes hasta el 24 de septiembre inclusive para abonar el 50% restante desde tu panel de usuario:`;
            } else {
              mensajeEspecial = `Tu pago ha sido procesado y aprobado con éxito. Tu stand ha sido reservado y <strong>abonado al 100%</strong>. A continuación, te presentamos los detalles oficiales de tu espacio:`;
            }

            // Inyectar las variables en la plantilla
            const htmlToSend = compiledTemplate({
              nombre: nombre,
              stand_nombre: stand_nombre,
              dimensiones: dimensiones,
              pago_id: paymentId || pago_id || 'N/A',
              mensaje_especial: mensajeEspecial
            });

            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
              from: 'onboarding@resend.dev', // Resend Sandbox exige este correo exacto
              to: email, // El correo del cliente real
              subject: isBalancePayment ? '🎟️ Saldo de Stand Completado - Expo Textil 2026' : '🎟️ Tu Ticket Oficial - Expo Textil 2026',
              html: htmlToSend
            });

            if (error) {
              console.error('Error de Resend (Webhook Real):', error);
            } else {
              console.log(`Correo enviado con éxito a ${email}. ID:`, data?.id);
            }
          } catch (err) {
            console.error('Error interno al compilar/enviar el correo (Webhook Real):', err);
          }
        }
      }
    } 
    else if (estado === 'rechazado') {
      // DEVOLVER STOCK (solo si no es pago de saldo restante, ya que el stand ya está reservado y el stock ya se restó)
      if (!isBalancePayment) {
        const [rows] = await pool.query<any>('SELECT stand_id FROM compras_stands WHERE id = ?', [compraId]);
        if (rows.length > 0) {
           await pool.query('UPDATE stands SET stock_disponible = stock_disponible + 1 WHERE id = ?', [rows[0].stand_id]);
        }
      }
    }

    // RESPUESTA OBLIGATORIA MP
    res.status(200).send('Webhook Received successfully');
  } catch (error) {
    console.error('Error procesando el Webhook de MercadoPago:', error);
    res.status(500).send('Webhook processing error');
  }
};

// ========================================================
// ENDPOINT DESARROLLO (Testing Webhooks)
// ========================================================
export const simulateWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { compraId: rawCompraId, estado: paramEstado } = req.body;

    if (!rawCompraId || !paramEstado) {
      res.status(400).json({ message: 'Faltan parámetros requeridos: compraId y estado' });
      return;
    }

    const isBalancePayment = String(rawCompraId).startsWith('saldo-');
    const compraId = isBalancePayment 
      ? Number(String(rawCompraId).replace('saldo-', ''))
      : Number(rawCompraId);

    // MAPEO SEGURO SIMULADOR
    let estado = 'pendiente';
    if (paramEstado === 'approved' || paramEstado === 'aprobado') estado = 'aprobado';
    if (paramEstado === 'rejected' || paramEstado === 'rechazado' || paramEstado === 'cancelled') estado = 'rechazado';

    const paymentId = 'SIMULACION-' + Date.now();

    // Obtener estado actual de la DB en el simulador
    const [compraCheck] = await pool.query<any>('SELECT estado, tipo_pago, saldo_pagado, stand_id FROM compras_stands WHERE id = ?', [compraId]);
    if (compraCheck.length === 0) {
      res.status(404).json({ message: `No se encontró la compra con ID ${compraId}` });
      return;
    }

    const { estado: currentEstado, tipo_pago: currentTipoPago, saldo_pagado: currentSaldoPagado, stand_id } = compraCheck[0];

    // Detección inteligente para el simulador:
    // Si no tiene el prefijo "saldo-" pero en la DB ya está aprobado como seña pendiente de saldo,
    // y el estado a simular es "aprobado", asumimos automáticamente que es el pago del saldo restante.
    let detectadoComoSaldo = isBalancePayment;
    if (!isBalancePayment && estado === 'aprobado' && currentEstado === 'aprobado' && currentTipoPago === 'seña' && currentSaldoPagado === 0) {
      detectadoComoSaldo = true;
    }

    let sendEmail = false;

    // ACTUALIZAR ESTADO DB FALSO (SIMULADOR)
    if (estado === 'aprobado') {
      if (detectadoComoSaldo) {
        if (currentSaldoPagado === 0) {
          await pool.query(`
            UPDATE compras_stands c
            INNER JOIN stands s ON c.stand_id = s.id
            SET c.saldo_pagado = 1, c.monto_pagado = c.monto_pagado + (s.precio / 2)
            WHERE c.id = ?
          `, [compraId]);
          sendEmail = true;
        }
      } else {
        if (currentEstado !== 'aprobado') {
          const [standRows] = await pool.query<any>('SELECT precio FROM stands WHERE id = ?', [stand_id]);
          const standPrecio = standRows.length > 0 ? Number(standRows[0].precio) : 0;
          
          const esSeña = currentTipoPago === 'seña';
          const montoAPagar = esSeña ? (standPrecio / 2) : standPrecio;
          const saldoPagadoVal = esSeña ? 0 : 1;

          await pool.query(
            'UPDATE compras_stands SET estado = ?, pago_id = ?, saldo_pagado = ?, monto_pagado = ? WHERE id = ?',
            [estado, paymentId, saldoPagadoVal, montoAPagar, compraId]
          );
          sendEmail = true;
        } else {
          // Si ya está aprobado y no es saldo, solo actualizamos el pago_id simulado para no resetear valores
          await pool.query(
            'UPDATE compras_stands SET pago_id = ? WHERE id = ?',
            [paymentId, compraId]
          );
        }
      }
    } else {
      if (currentEstado !== 'aprobado') {
        await pool.query(
          'UPDATE compras_stands SET estado = ?, pago_id = ? WHERE id = ?',
          [estado, paymentId, compraId]
        );
      }
    }

    // LOGICA DE NEGOCIO SIMULADOR
    if (estado === 'aprobado' && sendEmail) {
      const [rows] = await pool.query<any>(`
        SELECT c.usuario_id, u.email, u.nombre, s.nombre as stand_nombre, s.dimensiones, c.pago_id, c.tipo_pago, c.saldo_pagado
        FROM compras_stands c
        INNER JOIN usuarios u ON c.usuario_id = u.id
        INNER JOIN stands s ON c.stand_id = s.id
        WHERE c.id = ?
      `, [compraId]);

      if (rows.length > 0) {
        const { usuario_id, email, nombre, stand_nombre, dimensiones, pago_id, tipo_pago, saldo_pagado } = rows[0];
        await pool.query('UPDATE usuarios SET rol = ? WHERE id = ?', ['expositor', usuario_id]);

        // FUNCION CORREO SIMULADOR
        if (process.env.RESEND_API_KEY) {
          try {
            // Leer y compilar la plantilla de Handlebars
            const compiledTemplate = handlebars.compile(ticketTemplate);
            
            // Personalizar mensaje según modalidad
            let mensajeEspecial = '';
            if (detectadoComoSaldo) {
              mensajeEspecial = `¡Tu pago de saldo restante ha sido aprobado con éxito! Tu stand ha quedado <strong>100% abonado y completado</strong>. A continuación, te presentamos los detalles oficiales de tu espacio:`;
            } else if (tipo_pago === 'seña') {
              mensajeEspecial = `¡Tu pago de seña ha sido aprobado con éxito! Tu stand ha quedado reservado bajo la modalidad de <strong>Seña (50%)</strong>. A continuación, te presentamos los detalles de tu espacio. Recuerda que tienes hasta el 24 de septiembre inclusive para abonar el 50% restante desde tu panel de usuario:`;
            } else {
              mensajeEspecial = `Tu pago ha sido procesado y aprobado con éxito. Tu stand ha sido reservado y <strong>abonado al 100%</strong>. A continuación, te presentamos los detalles oficiales de tu espacio:`;
            }

            // Inyectar las variables en la plantilla
            const htmlToSend = compiledTemplate({
              nombre: nombre,
              stand_nombre: stand_nombre,
              dimensiones: dimensiones,
              pago_id: paymentId,
              mensaje_especial: mensajeEspecial
            });

            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
              from: 'Tickets Expo Textil <ventas@expotextilgrafica.com>', // Resend Sandbox exige este correo exacto
              to: email, // El correo del cliente que registró
              subject: detectadoComoSaldo ? '🎟️ Saldo de Stand Completado - Expo Textil 2026' : '🎟️ Tu Ticket Oficial - Expo Textil 2026',
              html: htmlToSend
            });

            if (error) {
              console.error('Error de Resend (Simulador):', error);
            } else {
              console.log(`Correo Simulado enviado con éxito a ${email}. ID:`, data?.id);
            }
          } catch (err) {
            console.error('Error interno al compilar/enviar el correo (Simulador):', err);
          }
        }
      }
    } else if (estado === 'rechazado') {
      if (!detectadoComoSaldo) {
        const [rows] = await pool.query<any>('SELECT stand_id FROM compras_stands WHERE id = ?', [compraId]);
        if (rows.length > 0) {
           await pool.query('UPDATE stands SET stock_disponible = stock_disponible + 1 WHERE id = ?', [rows[0].stand_id]);
        }
      }
    }

    res.status(200).json({ message: `Webhook simulado procesado correctamente. Nueva orden #${compraId} -> ${estado}` });
  } catch (error) {
    console.error('Error en el simulador de Webhooks:', error);
    res.status(500).json({ message: 'Error interno simulando webhook' });
  }
};
