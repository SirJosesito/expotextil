CREATE DATABASE IF NOT EXISTS expotextil;
USE expotextil;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('registrado', 'expositor', 'prensa', 'admin') DEFAULT 'registrado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Inventario de Stands
CREATE TABLE IF NOT EXISTS stands (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    dimensiones VARCHAR(50) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock_disponible INT NOT NULL DEFAULT 0,
    descripcion TEXT
);

-- Inicializar el stock
INSERT IGNORE INTO stands (id, nombre, dimensiones, precio, stock_disponible, descripcion) VALUES
('basico', 'Stand BÁSICO', '4x6mts', 80000.00, 20, 'Espacio ideal para emprendedores o pequeñas marcas que buscan visibilidad.'),
('estandar', 'Stand ESTÁNDAR', '6x6mts', 150000.00, 15, 'Nuestra opción más popular. Excelente relación espacio/ubicación para marcas establecidas.'),
('industrial', 'Stand INDUSTRIAL', '6x8mts', 450000.00, 10, 'Ubicación premium en la isla central. Máxima exposición para industrias líderes.');

-- Tabla de Compras/Reservas (Vincula Usuario con Stand y MercadoPago)
CREATE TABLE IF NOT EXISTS compras_stands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    stand_id VARCHAR(50) NOT NULL,
    pago_id VARCHAR(100), -- ID que nos devolverá MercadoPago
    estado ENUM('pendiente', 'aprobado', 'rechazado', 'expirado') DEFAULT 'pendiente',
    tipo_pago ENUM('completo', 'seña') DEFAULT 'completo',
    saldo_pagado TINYINT(1) DEFAULT 0,
    monto_pagado DECIMAL(10, 2) DEFAULT 0.00,
    detalles_adicionales TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (stand_id) REFERENCES stands(id)
);

