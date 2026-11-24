import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings


def migrate():
    is_mysql = settings.DATABASE_URL.startswith("mysql")
    sql_path = ROOT_DIR / "aws" / ("init_rds_mysql.sql" if is_mysql else "init_rds.sql")
    target = settings.DB_HOST or settings.DATABASE_URL.split("@")[-1]
    engine_name = "MySQL" if is_mysql else "PostgreSQL"

    print(f"1. Conectando a {engine_name} en {target}...")
    try:
        sql = sql_path.read_text(encoding="utf-8")
        if is_mysql:
            import pymysql

            ssl_cfg = {"ca": settings.resolved_sslrootcert} if settings.resolved_sslrootcert else None
            conn = pymysql.connect(
                host=settings.DB_HOST or "localhost",
                port=int(settings.DB_PORT or 3306),
                user=settings.DB_USER or "root",
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME or "cloudstore",
                charset="utf8mb4",
                ssl=ssl_cfg,
                connect_timeout=15,
            )
            print(f"✓ ¡CONEXIÓN ESTABLECIDA CON ÉXITO A {engine_name}!\n")
            print(f"2. Ejecutando script DDL y datos semilla ({sql_path.name})...")
            with conn.cursor() as cur:
                for stmt in [s.strip() for s in sql.split(";") if s.strip()]:
                    cur.execute(stmt)
            conn.commit()
            with conn.cursor() as cur:
                cur.execute("SHOW TABLES;")
                tables = [r[0] for r in cur.fetchall()]
                print("  - Tablas encontradas:", tables)
            conn.close()
        else:
            import psycopg

            conn = psycopg.connect(settings.DATABASE_URL, connect_timeout=15)
            print(f"✓ ¡CONEXIÓN ESTABLECIDA CON ÉXITO A {engine_name}!\n")
            print(f"2. Ejecutando script DDL y datos semilla ({sql_path.name})...")
            with conn.cursor() as cur:
                cur.execute(sql)
            conn.commit()
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
                )
                tables = [r[0] for r in cur.fetchall()]
                print("  - Tablas encontradas:", tables)
            conn.close()

        print("\n✓ ¡TABLAS Y DATOS MIGRADOS EXITOSAMENTE!")
    except Exception as e:
        print(f"Error al conectar con {engine_name}: {e}")
        sys.exit(1)


if __name__ == "__main__":
    migrate()
