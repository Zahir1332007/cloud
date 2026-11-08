-- ==============================================================================
-- CloudStore E-Commerce - AWS RDS / Aurora PostgreSQL DDL & Seed Script
-- Región: us-east-2 (Ohio) | Compatible con PostgreSQL 14 / 15 / 16 en Amazon RDS
-- ==============================================================================

-- 1. TABLA: users (Usuarios y Roles)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. TABLA: categories (Categorías de Catálogo)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. TABLA: products (Inventario y Productos)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0 NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00 NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. TABLA: orders (Órdenes y Checkout)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    shipping_address TEXT NOT NULL,
    phone VARCHAR(50),
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'paid' NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'credit_card' NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. TABLA: order_items (Líneas de Detalle de Órdenes)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- ==============================================================================
-- INSERCIÓN DE DATOS SEMILLA (CATEGORÍAS)
-- ==============================================================================
INSERT INTO categories (id, name, slug, description, image_url) VALUES 
(1, 'Laptops & Computadoras', 'laptops-computadoras', 'Equipos portátiles de alto rendimiento para desarrollo, diseño y gaming.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'),
(2, 'Smartphones & Tablets', 'smartphones-tablets', 'Dispositivos móviles de última generación con cámaras pro y pantallas OLED.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'),
(3, 'Periféricos & Gaming', 'perifericos-gaming', 'Teclados mecánicos, ratones ergonómicos y monitores ultra wide.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80'),
(4, 'Audio & Auriculares', 'audio-auriculares', 'Cancelación activa de ruido, sonido espacial y fidelidad de estudio.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- INSERCIÓN DE DATOS SEMILLA (USUARIOS DEMO)
-- Contraseña Admin: Admin123! | Contraseña Cliente: Cliente123!
-- ==============================================================================
INSERT INTO users (id, email, hashed_password, full_name, role, is_active) VALUES 
(1, 'admin@cloudstore.com', '$2b$12$NqO/uD240b9zE6o6Nq86b.78l1E7FjK6CjLgI9D3M6mQ7l8K1v8a.', 'Administrador CloudStore', 'admin', true),
(2, 'cliente@cloudstore.com', '$2b$12$R0h6Z8J1Q7F8m7L9X0v3m.78l1E7FjK6CjLgI9D3M6mQ7l8K1v8a.', 'Juan Perez Gomez', 'customer', true)
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- INSERCIÓN DE DATOS SEMILLA (PRODUCTOS)
-- ==============================================================================
INSERT INTO products (name, slug, description, price, stock, image_url, category_id, rating) VALUES 
('MacBook Pro 16'' M3 Max', 'macbook-pro-16-m3-max', 'Potencia extrema para profesionales de software y arquitectura cloud. 36GB RAM unificada, 1TB SSD ultrarrápido y pantalla Liquid Retina XDR.', 2899.99, 15, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', 1, 4.95),
('Dell XPS 15 OLED Touch', 'dell-xps-15-oled-touch', 'Intel Core i9 14th Gen, 32GB DDR5, RTX 4070. Chasis de aluminio anodizado y pantalla 3.5K OLED con colores cinematográficos.', 2199.50, 8, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80', 1, 4.80),
('ThinkPad X1 Carbon Gen 11', 'thinkpad-x1-carbon-gen-11', 'El estándar dorado de ultrabooks empresariales y desarrolladores Linux. Teclado legendario, peso ultrapluma y certificación militar.', 1749.00, 12, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', 1, 4.85),
('iPhone 16 Pro Max 256GB', 'iphone-16-pro-max-256gb', 'Construcción en titanio de grado aeroespacial, chip A18 Pro con Apple Intelligence y sistema de cámaras Pro con teleobjetivo 5x.', 1299.00, 25, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', 2, 4.90),
('Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Galaxy AI integrada, pantalla Dynamic AMOLED 2X plana antirreflejos de 120Hz, cámara de 200MP y S-Pen integrado.', 1199.99, 20, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', 2, 4.88),
('iPad Pro 13'' M4 OLED', 'ipad-pro-13-m4-oled', 'Increíblemente delgado con pantalla Ultra Retina XDR Tandem OLED. Máximo rendimiento gráfico para ilustración y productividad.', 1399.00, 10, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', 2, 4.92),
('Teclado Mecánico Custom Keychron Q1 Pro', 'teclado-keychron-q1-pro', 'Cuerpo entero de aluminio mecanizado CNC, switches Gateron Jupiter Banano lubricados, conectividad inalámbrica Bluetooth y QMK/VIA.', 199.99, 30, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 3, 4.94),
('Mouse Ergonómico Logitech MX Master 3S', 'logitech-mx-master-3s', 'Clicks silenciosos, sensor Darkfield de 8000 DPI para tracking en cristal y rueda electromagnética MagSpeed ultra rápida.', 99.90, 45, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', 3, 4.97),
('Monitor Curvo Samsung Odyssey Neo G9 49''', 'monitor-samsung-odyssey-neo-g9', 'Resolución Dual QHD, tasa de refresco de 240Hz, Mini LED con HDR 2000 y curvatura envolvente 1000R para inmersión total.', 1499.00, 4, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 3, 4.75),
('Sony WH-1000XM5 Noise Cancelling', 'sony-wh-1000xm5-noise-cancelling', 'La mejor cancelación activa de ruido del mercado con dos procesadores y 8 micrófonos. 30 horas de batería y llamadas ultranítidas.', 349.99, 18, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 4, 4.91),
('AirPods Pro (2da Generación USB-C)', 'airpods-pro-2-usbc', 'Audio adaptativo con cancelación de ruido 2x más potente, modo ambiente inteligente y estuche con carga MagSafe y altavoz de rastreo.', 249.00, 35, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80', 4, 4.89),
('Micrófono Shure SM7B Broadcast', 'microfono-shure-sm7b', 'Micrófono dinámico cardioide legendario para streaming, podcasts y grabación vocal profesional en estudio.', 399.00, 9, 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80', 4, 4.98)
ON CONFLICT (slug) DO NOTHING;

-- 4. ORDEN DEMO INICIAL
INSERT INTO orders (id, order_number, user_id, customer_name, customer_email, shipping_address, phone, total_amount, status, payment_method) VALUES 
(1, 'ORD-20261108-DEMO01', 2, 'Juan Perez Gomez', 'cliente@cloudstore.com', 'Av. Universitaria 1234, Tingo María, Huánuco, Perú', '+51 987 654 321', 1448.99, 'paid', 'credit_card')
ON CONFLICT (order_number) DO NOTHING;

-- Actualizar secuencias automáticas de PostgreSQL
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM orders));

