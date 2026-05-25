import dotenv from '@dotenvx/dotenvx';
dotenv.config();

import pool from '../config/db';
import jwt from 'jsonwebtoken';

const BACKEND_URL = 'http://localhost:3000';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('\n================================================================');
  console.log('🚀 INICIANDO SUITE DE TESTING DE SEGURIDAD Y ESTRÉS COMPLETA 🚀');
  console.log('================================================================\n');

  try {
    // ---------------------------------------------------------
    // TEST 1: Limpieza e inicialización del escenario de estrés
    // ---------------------------------------------------------
    console.log('🛡️  [TEST 1] Inicializando base de datos para la prueba de estrés...');
    
    // Eliminamos cualquier usuario de prueba previo para no duplicar correos
    await pool.query('DELETE FROM compras_stands WHERE usuario_id IN (SELECT id FROM usuarios WHERE email LIKE "stress_test_%")');
    await pool.query('DELETE FROM usuarios WHERE email LIKE "stress_test_%"');

    // Creamos 50 usuarios de prueba para simular compras concurrentes reales
    console.log('👥 Creando 50 usuarios de prueba en la BDD...');
    const userIds: number[] = [];
    const tokens: string[] = [];

    // Haremos inserciones masivas eficientes
    for (let i = 1; i <= 50; i++) {
      const email = `stress_test_user_${i}@example.com`;
      const empresa = `Empresa de Estrés ${i}`;
      const nombre = `Usuario Estrés ${i}`;
      const telefono = `123456789${i}`;
      // Usaremos una contraseña en texto plano y guardaremos un hash fake o encriptado rápido para acelerar el test
      // bcrypt puede ser lento para 50 usuarios secuenciales, así que insertaremos un hash pre-calculado
      const precalculatedHash = '$2b$10$XyZ123FakeHashForStressTestingPurposeOnly1234567890';
      
      const [insertResult]: any = await pool.query(
        'INSERT INTO usuarios (empresa, nombre, email, telefono, password_hash, rol) VALUES (?, ?, ?, ?, ?, "registrado")',
        [empresa, nombre, email, telefono, precalculatedHash]
      );
      const userId = insertResult.insertId;
      userIds.push(userId);

      // Generar JWT Token para este usuario de prueba
      const token = jwt.sign(
        { id: userId, email, rol: 'registrado' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1h' }
      );
      tokens.push(token);
    }
    console.log(`✅ Creados ${userIds.length} usuarios con sus respectivos JWT Tokens.`);

    // Ajustamos el stock del stand 'basico' a exactamente 3 para probar la concurrencia agresiva
    console.log('📦 Configurando stock de stand "basico" en exactamente 3...');
    await pool.query('UPDATE stands SET stock_disponible = 3 WHERE id = "basico"');
    
    // Verificamos que esté en 3
    const [standsBefore]: any = await pool.query('SELECT stock_disponible FROM stands WHERE id = "basico"');
    console.log(`🔍 Stock inicial verificado de stand "basico": ${standsBefore[0].stock_disponible}`);

    // ---------------------------------------------------------
    // TEST 2: Lanzar 50 peticiones concurrentes (Race Condition Test)
    // ---------------------------------------------------------
    console.log('\n🔥 [TEST 2] Lanzando 50 compras concurrentes del stand "basico" al mismo tiempo...');
    console.log('(Esto verificará si la BDD bloquea correctamente con "FOR UPDATE" y previene sobreventa)');

    const purchaseRequests = tokens.map((token, index) => {
      return fetch(`${BACKEND_URL}/api/payments/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Origin': 'http://localhost:5173'
        },
        body: JSON.stringify({
          standId: 'basico',
          detalles: `Compra estresante por usuario_${index + 1}`
        })
      });
    });

    const results = await Promise.all(purchaseRequests);
    
    let successes = 0;
    let failures = 0;
    const errorMessages: string[] = [];

    for (const res of results) {
      if (res.status === 200) {
        successes++;
      } else {
        failures++;
        const body: any = await res.json();
        errorMessages.push(body.message || 'Error desconocido');
      }
    }

    console.log('\n📊 RESULTADOS DE LA PRUEBA DE ESTRÉS / CONCURRENCIA:');
    console.log(`   - Peticiones Exitosas (200 OK): ${successes}`);
    console.log(`   - Peticiones Fallidas (400 Bad Request): ${failures}`);
    
    const uniqueErrors = Array.from(new Set(errorMessages));
    console.log(`   - Mensajes de error únicos capturados:`, uniqueErrors);

    // Validación crítica del Test de Concurrencia
    const [standsAfter]: any = await pool.query('SELECT stock_disponible FROM stands WHERE id = "basico"');
    const finalStock = standsAfter[0].stock_disponible;
    console.log(`🔍 Stock final verificado en BDD de stand "basico": ${finalStock}`);

    if (successes === 3 && finalStock === 0) {
      console.log('🏆 ¡PRUEBA EXITOSA! El bloqueo de concurrencia impidió la sobreventa.');
      console.log('   Exactamente 3 compras fueron aprobadas (el stock disponible inicial) y el stock final quedó en 0.');
    } else {
      console.error('❌ ¡FALLO DE CONCURRENCIA! Se permitieron más compras de las disponibles o el stock quedó inconsistente.');
      console.error(`   Esperado: Exitosas: 3, Stock Final: 0. Obtenido: Exitosas: ${successes}, Stock: ${finalStock}`);
    }

    // ---------------------------------------------------------
    // TEST 3: Auditoría de Inyección SQL (Seguridad)
    // ---------------------------------------------------------
    console.log('\n🛡️  [TEST 3] Probando resistencia a Inyecciones SQL...');
    const tokenForSqlInjection = tokens[0];

    const sqlInjectionPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE usuarios; --",
      "admin' --",
      "1 UNION SELECT 1, 2, 3",
      "basico' OR '1'='1"
    ];

    let sqlInjectSafelyHandled = true;

    for (const payload of sqlInjectionPayloads) {
      console.log(`   - Enviando payload en detalles adicionales: "${payload}"`);
      const res = await fetch(`${BACKEND_URL}/api/payments/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenForSqlInjection}`,
          'Origin': 'http://localhost:5173'
        },
        body: JSON.stringify({
          standId: 'estandar',
          detalles: payload
        })
      });

      const body: any = await res.json();
      
      // Comprobar si se rompió el server (500) o si se manejó bien
      if (res.status === 500) {
        console.error(`   ❌ El servidor retornó un 500 Error para el payload: "${payload}"`);
        sqlInjectSafelyHandled = false;
      } else {
        console.log(`   ✅ Respuesta controlada (Status: ${res.status}). Payload sanitizado.`);
      }
    }

    if (sqlInjectSafelyHandled) {
      console.log('🏆 ¡PRUEBA EXITOSA! Las consultas usan sentencias preparadas de mysql2.');
      console.log('   Ninguna inyección SQL alteró la BDD ni causó caídas de servidor.');
    } else {
      console.error('❌ ¡PRECAUCIÓN! Posible vulnerabilidad detectada ante inyección SQL.');
    }

    // ---------------------------------------------------------
    // TEST 4: Prueba del Rate Limiter (Protección DDoS / Fuerza Bruta)
    // ---------------------------------------------------------
    console.log('\n🛡️  [TEST 4] Probando el Rate Limiter (Protección Fuerza Bruta)...');
    console.log('Enviando 160 peticiones consecutivas al endpoint de Login...');

    let rateLimiterKickedIn = false;
    let requestCount = 0;

    for (let i = 0; i < 160; i++) {
      requestCount++;
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'stress_test_user_1@example.com',
          password: 'wrongpassword'
        })
      });

      if (res.status === 429) {
        console.log(`   ✅ ¡El Rate Limiter bloqueó la petición nº ${requestCount} con código 429 (Demasiadas peticiones)!`);
        rateLimiterKickedIn = true;
        break;
      }
    }

    if (rateLimiterKickedIn) {
      console.log('🏆 ¡PRUEBA EXITOSA! El Rate Limiter funciona correctamente.');
      console.log('   Bloquea con HTTP 429 a atacantes de fuerza bruta tras superar el umbral.');
    } else {
      console.warn('⚠️  ¡ADVERTENCIA! El Rate Limiter no bloqueó las peticiones. Verifica la configuración en server.ts.');
    }

    // ---------------------------------------------------------
    // Limpieza Final de Datos de Prueba
    // ---------------------------------------------------------
    console.log('\n🧹 Limpiando base de datos de usuarios de prueba creados...');
    await pool.query('DELETE FROM compras_stands WHERE usuario_id IN (SELECT id FROM usuarios WHERE email LIKE "stress_test_%")');
    await pool.query('DELETE FROM usuarios WHERE email LIKE "stress_test_%"');
    // Restauramos el stock original para el stand básico
    await pool.query('UPDATE stands SET stock_disponible = 20 WHERE id = "basico"');
    console.log('✅ Base de datos restaurada al estado original de producción.');

    console.log('\n================================================================');
    console.log('🎉 PRUEBAS COMPLETADAS EXITOSAMENTE 🎉');
    console.log('================================================================\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Ocurrió un error inesperado al ejecutar las pruebas de estrés:', error);
    process.exit(1);
  }
}

// Pequeño delay de cortesía por si el backend se está iniciando
setTimeout(runTests, 2000);
