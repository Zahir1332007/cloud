# CloudStore — Tienda Virtual Cloud con Base de Datos en AWS

[![AWS Free Tier](https://img.shields.io/badge/AWS-Free%20Tier%20Eligible-orange?logo=amazon-aws)](https://aws.amazon.com/free/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.12-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-61DAFB?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?logo=postgresql)](https://www.postgresql.org)
[![Docker Compose](https://img.shields.io/badge/Orchestration-Docker%20Compose-2496ED?logo=docker)](https://www.docker.com)

**CloudStore** es una plataforma de comercio electrónico moderna, desacoplada y contenerizada, diseñada específicamente por y para ingenieros y arquitectos de software para su despliegue y evaluación en **Amazon Web Services (AWS)** bajo la **Capa Gratuita (Free Tier)**.

---

## 🏛️ Diagrama de Arquitectura de Software

```mermaid
graph TD
    User["🌐 Cliente / Navegador"] -->|HTTP / HTTPS Port 80/443| Nginx["🛡️ Nginx Reverse Proxy (Gateway)"]
    
    subgraph "Amazon EC2 (t2/t3.micro - Free Tier)"
        Nginx -->|/api/*| Backend["⚡ Backend API (FastAPI + Python 3.12)"]
        Nginx -->|/docs| Backend
        Nginx -->|/*| Frontend["⚛️ Frontend SPA (React + Tailwind + Vite)"]
        
        Backend -->|SQLAlchemy ORM (Port 5432)| Database[("🐘 Base de Datos (PostgreSQL 16)")]
        Database -->|Persistencia EBS| EBS["💾 AWS EBS Volume (gp3)"]
    end

    Backend -->|Health Probe| AWS_ALB["☁️ AWS ALB / Route 53 Health Checks"]
```

---

## 🚀 Características Principales

* **Backend Asíncrono de Alto Rendimiento:** Desarrollado con **FastAPI** y **Python 3.12**, con tipado estricto mediante **Pydantic v2** y documentación interactiva automática en `/docs` (Swagger UI).
* **Base de Datos Relacional ACID:** **PostgreSQL 16** con control transaccional estricto (bloqueo `SELECT FOR UPDATE` durante el checkout para evitar sobreventas o inconsistencias de stock en concurrencia). Fallback automático a SQLite para desarrollo sin Docker.
* **Frontend React SPA Pulido:** Construido con **Vite**, **TypeScript**, **Tailwind CSS**, y componentes con soporte de carrito persistente (`localStorage`), filtrado dinámico por categoría y precio, búsqueda en tiempo real y drawer deslizable.
* **Sistema de Autenticación & Autorización:** Tokens **JWT (JSON Web Tokens)** con hashing de contraseñas mediante **Bcrypt** y control de acceso basado en roles (`CUSTOMER` y `ADMIN`).
* **Panel de Administración Completo (`/admin`):**
  * Dashboard de métricas en tiempo real (Ingresos totales, órdenes recibidas, alertas de stock bajo).
  * CRUD interactivo de productos con subida de imágenes y stock.
  * Gestor de estados de pedidos (Pendiente -> Pagado -> En Preparación -> Enviado -> Entregado).
* **Rastreo de Pedidos en Vivo (`/track`):** Barra de progreso temporal de cada compra con código único (`ORD-YYYYMMDD-XXXX`).
* **Optimizado para AWS Free Tier:** Configuración de límites de memoria en contenedores y script de swap de 2GB que garantiza estabilidad total en instancias `t2.micro` o `t3.micro` (1 vCPU, 1 GB RAM).

---

## 📂 Estructura del Proyecto

```text
gratis3/
├── backend/                  # API REST FastAPI (Python 3.12)
│   ├── app/
│   │   ├── api/              # Endpoints v1 (auth, products, categories, orders, stats, health)
│   │   ├── core/             # Configuración, conexión a base de datos y seguridad JWT
│   │   ├── models/           # Modelos de datos SQLAlchemy (User, Product, Category, Order, OrderItem)
│   │   ├── schemas/          # Esquemas de validación Pydantic
│   │   ├── seed.py           # Generador de datos semilla automáticos (usuarios y catálogo inicial)
│   │   └── main.py           # Punto de entrada de la aplicación FastAPI
│   ├── Dockerfile            # Construcción multi-etapa optimizada para producción
│   └── requirements.txt      # Dependencias de Python
├── frontend/                 # Aplicación Cliente React (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Componentes reusables (Navbar, Footer, ProductCard, AWSBadge, CartDrawer)
│   │   ├── context/          # Manejadores globales de estado (AuthContext, CartContext)
│   │   ├── pages/            # Vistas (Home, Catalog, ProductDetail, Cart, Success, Track, Admin, Login)
│   │   ├── services/         # Cliente HTTP Axios configurado con interceptores JWT
│   │   └── types/            # Interfaces TypeScript
│   ├── Dockerfile            # Multi-etapa con servidor estático Nginx
│   └── nginx.conf            # Reglas de enrutamiento SPA y compresión Gzip
├── nginx/
│   └── default.conf          # Reverse proxy perimetral (Gateway)
├── aws/
│   ├── user-data.sh          # Script de aprovisionamiento automatizado para EC2 (SWAP + Docker)
│   ├── deploy-guide.md       # Guía detallada con capturas y pasos para la consola de AWS
│   └── cloudformation-template.yaml # Infraestructura como Código (IaC) para despliegue en 1 clic
├── docker-compose.yml        # Orquestación local y de producción en AWS
└── README.md                 # Documentación técnica
```

---

## ⚡ Ejecución Rápida con Docker Compose

El proyecto está diseñado para levantarse localmente o en cualquier servidor AWS con un solo comando:

```bash
docker compose up -d --build
```

Una vez finalizada la construcción, los servicios estarán disponibles en:
* 🛒 **Tienda Virtual (Frontend):** `http://localhost`
* 🩺 **AWS Health Check:** `http://localhost/api/v1/health`
* 📖 **Documentación Swagger API:** `http://localhost/docs`

---

## 🔑 Credenciales Preconfiguradas (Demo)

El sistema incluye un script semilla automático que inicializa la base de datos en su primer arranque con cuentas y catálogo listo para demostraciones:

| Rol | Correo | Contraseña | Capacidades |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@cloudstore.com` | `Admin123!` | Acceso a panel `/admin`, creación/edición de productos, cambio de estados de pedidos y métricas. |
| **Cliente** | `cliente@cloudstore.com` | `Cliente123!` | Navegación, compra, carrito, pago simulado y seguimiento de pedidos. |

*Nota: La pantalla de login incluye botones de autorelleno para demostraciones rápidas.*

---

## ☁️ Despliegue en AWS (EC2 Capa Gratuita)

Para el despliegue en AWS paso a paso, consulta el documento:
👉 **[Guía Completa de Despliegue en AWS (aws/deploy-guide.md)](./aws/deploy-guide.md)**

### Resumen en 3 pasos:
1. **Lanzar EC2:** Ubuntu Server 22.04 / 24.04 (`t2.micro` o `t3.micro`), con puertos `22`, `80` y `443` abiertos en el Security Group.
2. **Pegar User Data:** Copia el contenido de `aws/user-data.sh` en los detalles avanzados de la instancia.
3. **Iniciar Contenedores:** Conéctate vía SSH y ejecuta `sudo docker compose up -d --build`.

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Health Check para AWS ALB y Route 53 | Público |
| `POST` | `/api/v1/auth/login` | Autenticación y emisión de JWT | Público |
| `POST` | `/api/v1/auth/register` | Registro de nuevos clientes | Público |
| `GET` | `/api/v1/auth/me` | Obtener perfil del usuario actual | Autenticado |
| `GET` | `/api/v1/products` | Listar catálogo (filtros, paginación, búsqueda) | Público |
| `GET` | `/api/v1/products/{id_or_slug}` | Detalle de un producto específico | Público |
| `POST` | `/api/v1/products` | Crear nuevo producto | Admin |
| `PUT` | `/api/v1/products/{id}` | Actualizar datos y stock de producto | Admin |
| `DELETE` | `/api/v1/products/{id}` | Eliminar producto | Admin |
| `GET` | `/api/v1/categories` | Listar categorías de productos | Público |
| `POST` | `/api/v1/orders` | Checkout con control atómico de stock | Público / Cliente |
| `GET` | `/api/v1/orders` | Historial de pedidos | Cliente / Admin |
| `GET` | `/api/v1/orders/track/{code}` | Rastrear estado de orden por código | Público |
| `PATCH` | `/api/v1/orders/{id}/status` | Actualizar estado de orden | Admin |
| `GET` | `/api/v1/stats/dashboard` | Métricas financieras y de almacén | Admin |

---

## 👨‍💻 Créditos Académicos
* **Asignatura:** Computación en la Nube (Cloud Computing) - 6to Ciclo
* **Institución:** UNAS (Universidad Nacional Agraria de la Selva)
* **Arquitectura:** Microservicios desacoplados con Docker Compose y Nginx en AWS Free Tier

