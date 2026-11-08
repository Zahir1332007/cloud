# Guía Definitiva de Despliegue en AWS (Capa Gratuita / Free Tier)

Esta guía paso a paso te permitirá desplegar la tienda virtual **CloudStore** en Amazon Web Services (AWS) aprovechando al 100% la **Capa Gratuita (Free Tier)** sin incurrir en costos.

---

## 1. Arquitectura de Despliegue en AWS

```
               INTERNET (Usuarios / Evaluadores)
                             │
                             ▼
               ┌───────────────────────────────┐
               │    AWS EC2 (t2/t3.micro)      │
               │    Security Group: 80, 443, 22│
               │                               │
               │   ┌────────────────────────┐  │
               │   │ Nginx Reverse Proxy    │  │ (Puerto 80 / 443)
               │   └───────────┬────────────┘  │
               │               │               │
               │       ┌───────┴───────┐       │
               │       ▼               ▼       │
               │ ┌──────────┐    ┌──────────┐  │
               │ │ Frontend │    │ Backend  │  │
               │ │  React   │    │ FastAPI  │  │
               │ └──────────┘    └─────┬────┘  │
               │                       │       │
               │                       ▼       │
               │                 ┌──────────┐  │
               │                 │PostgreSQL│  │
               │                 │  Volume  │  │
               │                 └──────────┘  │
               └───────────────────────────────┘
```

### Componentes AWS y Reglas de la Capa Gratuita:
| Recurso AWS | Límite Gratuito Mensual | Configuración en este Proyecto | Costo |
| :--- | :--- | :--- | :--- |
| **Amazon EC2** | 750 horas/mes | Instancia `t2.micro` (o `t3.micro`) | **$0.00** |
| **Amazon EBS** | 30 GB almacenamiento | Disco gp3 de 20 GB a 30 GB | **$0.00** |
| **Transferencia de Datos** | 100 GB salida/mes | Tráfico web de demostración académica | **$0.00** |
| **IP Pública IPv4** | Asignada por EC2 | Auto-assign Public IP | **$0.00** |

---

## 2. Método Recomendado: Despliegue Rápido en Amazon EC2

### Paso 1: Lanzar la Instancia EC2 en la Consola de AWS
1. Ingresa a la **Consola de AWS**: [https://console.aws.amazon.com/ec2](https://console.aws.amazon.com/ec2).
2. Selecciona tu región preferida (por ejemplo: `us-east-1` N. Virginia o `us-east-2` Ohio).
3. Haz clic en **Launch Instances** (Lanzar instancias).
4. Configura los siguientes parámetros:
   - **Name:** `cloudstore-server`
   - **Application and OS Images:** Selecciona **Ubuntu** (Ubuntu Server 22.04 LTS o 24.04 LTS, 64-bit x86). *Asegúrate de que diga "Free tier eligible"*.
   - **Instance type:** Selecciona `t2.micro` (o `t3.micro` si estás en una región donde t3 es gratuita).
   - **Key pair (login):** Crea un nuevo par de claves (ejemplo: `cloudstore-key.pem`) y descárgalo a tu computadora.
   - **Network settings (Security Group):**
     - Marcar: **Allow SSH traffic from** -> `Anywhere (0.0.0.0/0)`
     - Marcar: **Allow HTTP traffic from the internet** (Puerto 80)
     - Marcar: **Allow HTTPS traffic from the internet** (Puerto 443)
   - **Configure storage:** Deja los `30 GiB` por defecto de tipo `gp3` (dentro de la capa gratuita).
5. Despliega la sección **Advanced details** (Detalles avanzados) al final de la página:
   - En el campo **User data**, copia y pega todo el contenido del archivo [`aws/user-data.sh`](./user-data.sh).
   - *(Esto instalará Docker, Docker Compose y configurará el archivo SWAP de 2GB automáticamente durante el inicio)*.
6. Haz clic en **Launch instance** (Lanzar instancia).

---

### Paso 2: Conectarse por SSH a la Instancia
Una vez que el estado de la instancia cambie a **Running**:
1. Copia la **Public IPv4 address** de tu instancia (ejemplo: `54.210.120.45`).
2. Abre tu terminal (PowerShell, Git Bash o Linux/Mac):
   ```bash
   # En Windows PowerShell o Mac/Linux:
   ssh -i "ruta/a/tu/cloudstore-key.pem" ubuntu@<TU_IP_PUBLICA_AWS>
   ```

---

### Paso 3: Subir el Código y Levantar el Proyecto

#### Opción A: Vía Git (La más rápida si subes el repositorio a GitHub)
```bash
# Dentro de la instancia EC2:
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git cloudstore
cd cloudstore
sudo docker compose up -d --build
```

#### Opción B: Copiando los archivos con SCP desde tu computadora
Desde tu terminal local (en la carpeta `c:\unas\6to ciclo\cloud\gratis3`):
```bash
scp -i "cloudstore-key.pem" -r ./* ubuntu@<TU_IP_PUBLICA_AWS>:/home/ubuntu/cloudstore/
```
Luego por SSH:
```bash
cd /home/ubuntu/cloudstore
sudo docker compose up -d --build
```

---

### Paso 4: Monitorear el Despliegue en EC2
Para verificar que los contenedores estén corriendo de forma óptima:
```bash
sudo docker compose ps
```
Salida esperada:
```
NAME               STATUS              PORTS
cloudstore_db      Up (healthy)        5432/tcp
cloudstore_api     Up (healthy)        8000/tcp
cloudstore_ui      Up                  80/tcp
cloudstore_proxy   Up                  0.0.0.0:80->80/tcp
```

Ver logs del backend (donde verás la inicialización de la base de datos y el auto-seeding):
```bash
sudo docker compose logs -f backend
```

---

## 3. Verificación de Funcionamiento

Abre tu navegador web y visita:

1. **Tienda Virtual (Frontend):**
   ```text
   http://<TU_IP_PUBLICA_AWS>
   ```
2. **API Health Check (Verificación Cloud):**
   ```text
   http://<TU_IP_PUBLICA_AWS>/api/v1/health
   ```
   *Respuesta JSON esperada:*
   ```json
   {
     "status": "healthy",
     "database": "ok",
     "service": "CloudStore API",
     "environment": "production"
   }
   ```
3. **Documentación Swagger OpenAPI:**
   ```text
   http://<TU_IP_PUBLICA_AWS>/docs
   ```

---

## 4. Usuarios de Prueba Preconfigurados

| Rol | Correo | Contraseña | Capacidades |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@cloudstore.com` | `Admin123!` | Acceso a panel `/admin`, creación/edición de productos, cambio de estados de pedidos y métricas. |
| **Cliente** | `cliente@cloudstore.com` | `Cliente123!` | Navegación, compra, carrito, pago simulado y seguimiento de pedidos. |

---

## 5. Opción con Base de Datos AWS RDS PostgreSQL (Alternativa Gestionada)

Si para tu evaluación académica el docente requiere que la base de datos no resida dentro del contenedor, sino en **Amazon RDS (Managed PostgreSQL)**:

1. Ve a **RDS** -> **Create database**.
2. Selecciona **PostgreSQL**.
3. En **Templates**, marca **Free tier** (Capa gratuita).
4. Elige `db.t3.micro` o `db.t4g.micro`.
5. En **Connectivity**, asocia la misma VPC y Security Group de la instancia EC2.
6. En tu instancia EC2, edita el archivo `.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:<PASSWORD>@<RDS_ENDPOINT>:5432/cloudstore
   ```
7. En `docker-compose.yml`, comenta el servicio `postgres` y reinicia con:
   ```bash
   sudo docker compose up -d --build backend
   ```
¡La API se conectará instantáneamente a AWS RDS!

---

## 6. Comandos Útiles de Mantenimiento

```bash
# Ver uso de memoria RAM (gracias al SWAP nunca se agotará)
free -m

# Reiniciar todos los servicios
sudo docker compose restart

# Detener todos los servicios
sudo docker compose down

# Ver logs en tiempo real
sudo docker compose logs -f
```

