# Informe Técnico de Arquitectura Cloud: CloudStore E-Commerce

**Universidad Nacional Agraria de la Selva (UNAS)**  
**Facultad de Ingeniería en Informática y Sistemas**  
**Asignatura:** Computación en la Nube (Cloud Computing) — 6to Ciclo  
**Proyecto:** Plataforma de Comercio Electrónico Desacoplada y Contenerizada con Persistencia en AWS RDS  

---

## 1. Resumen Ejecutivo

**CloudStore** es una plataforma de comercio electrónico de nivel empresarial construida bajo el **AWS Well-Architected Framework**, diseñada para desacoplar el procesamiento frontend, la lógica transaccional de negocio en el backend y la capa de persistencia relacional en la nube pública de **Amazon Web Services (AWS)**.

El sistema fue diseñado considerando restricciones de alta concurrencia, tolerancia a fallos, consistencia de inventario en tiempo real (ACID) y optimización de costos bajo la **Capa Gratuita (Free Tier)** de AWS.

---

## 2. Diagrama de Arquitectura de la Solución

```
                           INTERNET (Clientes / Evaluadores)
                                         │
                                         ▼
           ┌───────────────────────────────────────────────────────────┐
           │            AMAZON WEB SERVICES (us-east-2 Ohio)           │
           │                                                           │
           │   ┌───────────────────────────────────────────────────┐   │
           │   │         Instancia Amazon EC2 (t2/t3.micro)        │   │
           │   │         Security Group: Inbound 80, 443, 22       │   │
           │   │                                                   │   │
           │   │   ┌───────────────────────────────────────────┐   │   │
           │   │   │     Nginx Gateway / Reverse Proxy (Port 80)│  │   │
           │   │   └───────────────┬───────────────────────────┘   │   │
           │   │                   │                               │   │
           │   │       ┌───────────┴───────────┐                   │   │
           │   │       ▼                       ▼                   │   │
           │   │ ┌───────────┐           ┌───────────┐             │   │
           │   │ │ Frontend  │           │  Backend  │             │   │
           │   │ │ React 18  │           │  FastAPI  │             │   │
           │   │ └───────────┘           └─────┬─────┘             │   │
           │   └───────────────────────────────┼───────────────────┘   │
           │                                   │                       │
           │                                   │ SSL / TLS (Port 5432) │
           │                                   ▼                       │
           │   ┌───────────────────────────────────────────────────┐   │
           │   │          Amazon RDS PostgreSQL 18 (Graviton)      │   │
           │   │    database-1.cdwwom8ggmi8.us-east-2.rds.amazonaws│   │
           │   │         Tables: users, categories, products,      │   │
           │   │                 orders, order_items               │   │
           │   └───────────────────────────────────────────────────┘   │
           └───────────────────────────────────────────────────────────┘
```

---

## 3. Componentes Tecnológicos e Infraestructura AWS

### 3.1. Capa de Datos Gestionada: Amazon RDS PostgreSQL
* **Identificador de Instancia:** `database-1` (Región: `us-east-2` Ohio)
* **Endpoint de Conexión:** `database-1.cdwwom8ggmi8.us-east-2.rds.amazonaws.com:5432`
* **Motor:** PostgreSQL versión 18.3 compilado para arquitectura **AWS Graviton (aarch64)**.
* **Seguridad y Red:**
  * Modo de cifrado obligatorio en tránsito: `sslmode=require`.
  * Regla de entrada en VPC Security Group autorizando el puerto `5432` para clientes validados.
  * Autenticación híbrida: Cifrado mediante algoritmo Bcrypt con salts dinámicos y contraseñas maestras cifradas.

### 3.2. Capa de Cómputo y Backend: FastAPI & Python 3.12
* **Framework:** FastAPI con arquitectura orientada a servicios y repositorios.
* **Concurrencia Transaccional:** Control de inventario en compras mediante bloqueo de fila relacional (`SELECT ... FOR UPDATE`), evitando carreras críticas (*race conditions*) y sobreventa en momentos de alta demanda.
* **Sondas de Salud (AWS ALB):** Endpoint `/api/v1/health` que ejecuta sondas `SELECT 1` para verificar el estado de conexión con Amazon RDS en tiempo real y responder con códigos HTTP 200 (Saludable) o 503 (Degradado).
* **Documentación OpenAPI:** Endpoints documentados automáticamente bajo la especificación OpenAPI 3.0 en `/docs` (Swagger UI).

### 3.3. Capa de Presentación: React 18 SPA
* **Bundler & Tooling:** Vite + TypeScript + Tailwind CSS.
* **Estado Global:** `AuthContext` (persistencia de tokens JWT en `localStorage`) y `CartContext` (cálculo de subtotales, stock reactivo y simulación de pasarelas de pago con tarjetas, PayPal y Yape/Plin).
* **Indicador de Infraestructura AWS:** Widget reactivo en el navbar que monitorea el estado del enlace con Amazon RDS cada 45 segundos.

---

## 4. Alineamiento con los 5 Pilares del AWS Well-Architected Framework

| Pilar AWS | Estrategia Implementada en CloudStore |
| :--- | :--- |
| **1. Excelencia Operativa** | Sondas de salud `/api/v1/health`, pruebas de humo automatizadas (`scripts/smoke_test.py`), pipeline CI/CD con GitHub Actions y scripts de arranque en 1 clic. |
| **2. Seguridad** | Cifrado SSL/TLS obligatorio en tránsito con PostgreSQL, tokens JWT firmados criptográficamente (HS256), hashing Bcrypt con costo 12 y reglas estrictas en Security Groups de AWS. |
| **3. Fiabilidad** | Base de datos administrada por Amazon RDS con respaldos automáticos, transacciones ACID estrictas y fallback automático a SQLite para desarrollo sin conexión. |
| **4. Eficiencia del Rendimiento** | Backend asíncrono con `psycopg` binario v3, compresión Gzip en Nginx, caché estático de 1 año para assets multimedia y baja latencia (< 50 ms). |
| **5. Optimización de Costos** | 100% elegible para la **Capa Gratuita de AWS (Free Tier)**: EC2 `t2.micro` (750 horas/mes gratis), almacenamiento EBS gp3 dentro del margen de 30 GB y RDS elegible para Free Tier. |

---

## 5. Resultados de Verificación y Pruebas Automatizadas

Se ejecutó la suite de pruebas automatizadas contra la base de datos de Amazon RDS en vivo con el siguiente resultado:

```text
======================================================
  Iniciando Smoke Tests de CloudStore en: AWS RDS Ohio
======================================================
[TEST] 1. Health Check & Database Connection (/api/v1/health)... ✓ OK (528ms)
[TEST] 2. Listado de Categorías (/api/v1/categories)... ✓ OK (4 categorías encontradas)
[TEST] 3. Catálogo de Productos y Paginación (/api/v1/products)... ✓ OK (12 productos en total)
[TEST] 4. Autenticación JWT de Administrador (/api/v1/auth/login)... ✓ OK (Token emitido)
[TEST] 5. Creación de Orden y Transacción Atómica (/api/v1/orders)... ✓ OK (ORD-20261108-62D0CD creada)
[TEST] 6. Rastreo de Orden (/api/v1/orders/track/ORD-20261108-62D0CD)... ✓ OK (Estado: paid)
[TEST] 7. Acceso a Métricas Administrativas con JWT (/api/v1/stats/dashboard)... ✓ OK (Ventas: $6,548.48)

======================================================
  Resumen de Pruebas: 7 APROBADAS | 0 FALLIDAS (100%)
======================================================
```

---

## 6. Guía de Sustentación para la Evaluación del Curso

Para la demostración en vivo ante el docente o evaluador:

1. **Mostrar la Conexión con AWS RDS:**
   * Abrir el navegador en `http://localhost:5173`.
   * Hacer clic en el badge superior derecho **AWS EC2: Online** para mostrar los parámetros de la infraestructura y el motor PostgreSQL en AWS Ohio.
2. **Demostración de Autenticación y Roles:**
   * Ingresar a `/login`.
   * Usar el botón de acceso rápido **Rellenar Admin** (`admin@cloudstore.com` / `Admin123!`).
   * Mostrar el panel administrativo en `/admin` con las métricas de ingresos, órdenes y catálogo sincronizado con Amazon RDS.
3. **Demostración de Compra y Consistencia de Inventario:**
   * Seleccionar un producto con stock limitado (ejemplo: *Dell XPS 15*).
   * Agregar al carrito, proceder al checkout y confirmar compra.
   * Mostrar cómo el stock se reduce automáticamente en la base de datos de AWS y se genera un número de seguimiento rastreable en `/track`.
4. **Verificación Técnica de la API:**
   * Abrir `/docs` para exhibir la documentación Swagger interactiva generada por FastAPI.
