import os
import sys
import psycopg

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.core.config import settings

print(f"1. Conectando a Amazon RDS PostgreSQL en {settings.DB_HOST or settings.DATABASE_URL.split('@')[-1]}...")

try:
    conn = psycopg.connect(settings.DATABASE_URL, connect_timeout=15)
    print("✓ ¡CONEXIÓN ESTABLECIDA CON ÉXITO A AWS RDS!\n")

    # Leer el script SQL completo
    print("2. Leyendo script DDL y de datos semilla (aws/init_rds.sql)...")
    with open("aws/init_rds.sql", "r", encoding="utf-8") as f:
        sql = f.read()

    # Ejecutar la migración
    print("3. Creando tablas (users, categories, products, orders, order_items) en AWS...")
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()
    print("✓ ¡TABLAS Y DATOS MIGRADOS EXITOSAMENTE A AWS RDS!\n")

    # Verificación
    print("4. Verificando integridad de los datos en la nube...")
    with conn.cursor() as cur:
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = [r[0] for r in cur.fetchall()]
        print("  - Tablas encontradas en AWS:", tables)

        cur.execute("SELECT COUNT(*) FROM categories")
        cat_count = cur.fetchone()[0]
        print(f"  - Categorías insertadas: {cat_count}")

        cur.execute("SELECT COUNT(*) FROM products")
        prod_count = cur.fetchone()[0]
        print(f"  - Productos insertados: {prod_count}")

        cur.execute("SELECT COUNT(*) FROM users")
        user_count = cur.fetchone()[0]
        print(f"  - Usuarios insertados: {user_count}")

        cur.execute("SELECT COUNT(*) FROM orders")
        order_count = cur.fetchone()[0]
        print(f"  - Órdenes demo insertadas: {order_count}")

    conn.close()
    print("\n==================================================================")
    print("  ¡LA BASE DE DATOS ESTÁ 100% OPERATIVA EN AMAZON WEB SERVICES!")
    print("==================================================================")

except Exception as e:
    print("Error al conectar con RDS:", str(e))
    sys.exit(1)

