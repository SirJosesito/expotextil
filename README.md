# 🎟️ Plataforma Web EXPO TEXTIL 2026

Una solución digital interactiva, moderna y de alto rendimiento diseñada para la **Expo Textil 2026** (Concordia, Entre Ríos). Este portal permite a empresas y marcas del sector registrarse de forma ágil, seleccionar y reservar sus stands comerciales, y asegurar su participación en el evento textil más importante de la región.

---

## 🌟 Propuesta de la Plataforma

El sistema ofrece una experiencia fluida e intuitiva tanto para los expositores como para los organizadores, optimizando las inscripciones y digitalizando todo el proceso de acreditación:

* **Presentación Visual de Alto Impacto**: Una interfaz moderna y responsive con un diseño industrial, loops multimedia integrados y micro-animaciones dinámicas que capturan la atención del usuario desde el primer instante.
* **Tienda Interactiva de Stands**: Mapa digital e interactivo que muestra la disponibilidad de stands en tiempo real, desglosando dimensiones, categorías y costos asociados.
* **Modalidad de Pago Flexible (Seña / Completo)**:
  * **Pago Completo**: Permite la liquidación total e inmediata del stand.
  * **Pago de Seña (50%)**: Facilita la reserva inmediata abonando solo la mitad del valor del stand. El usuario obtiene acceso a su panel y puede abonar el saldo restante de forma autónoma antes de la fecha límite establecida.
* **Panel del Expositor (Dashboard)**: Espacio de autogestión donde cada usuario registrado puede seguir el estado de su reserva, descargar su ticket, visualizar sus saldos pendientes y completar pagos pendientes de manera directa.
* **Acreditaciones y Notificaciones Automatizadas**: Despacho automático de tickets oficiales y comprobantes interactivos directamente a la casilla de correo del expositor una vez acreditados los pagos.

---

## 🛠️ Tecnologías Principales

La aplicación utiliza un stack tecnológico moderno y desacoplado para asegurar estabilidad, rendimiento y seguridad:

* **Frontend**: React.js con TypeScript, Vite para una compilación ultra-rápida y Vanilla CSS estructurado para un control visual a medida.
* **Backend**: Node.js con Express y TypeScript para la gestión de APIs y la lógica de negocio.
* **Base de Datos**: Motor SQL (MySQL) para un almacenamiento robusto y consistente de usuarios, inventario de stands y transacciones.
* **Integraciones Clave**:
  * **Mercado Pago**: Pasarela de pagos integrada para el procesamiento seguro de transacciones en pesos argentinos (ARS).
  * **Resend**: Servicio premium de mensajería para el despacho automático de tickets transaccionales oficiales.

---

## 🚀 Guía de Inicio Rápido (Desarrollo Local)

### 1. Servidor de API (Backend)
```bash
cd backend
npm install
npm run dev
```

### 2. Portal Web (Frontend)
```bash
cd frontend
npm install
npm run dev
```

El portal web estará accesible de forma local en `http://localhost:5173`.

---

*Desarrollado para potenciar y conectar la industria textil del litoral argentino.* 🇦🇷✨