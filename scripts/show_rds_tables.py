import os
import psycopg

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:CloudStore2026!@database-1.cdwwom8ggmi8.us-east-2.rds.amazonaws.com:5432/postgres?sslmode=require"
)

def inspect_database():
    print("=" * 60)
    print("  AWS RDS PostgreSQL - Inspección de Tablas y Registros")
    print("=" * 60)
    
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            # 1. List all user tables
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = [row[0] for row in cur.fetchall()]
            
            print(f"\n[+] Tablas encontradas en la BD ({len(tables)}):")
            for t in tables:
                # Count records
                cur.execute(f"SELECT COUNT(*) FROM \"{t}\";")
                count = cur.fetchone()[0]
                print(f"    - {t:<20} -> {count} registros")

            print("\n" + "=" * 60)
            print("  Detalle de Contenido en AWS RDS:")
            print("=" * 60)

            # 2. Show categories
            if "categories" in tables:
                print("\n[*] Tabla 'categories':")
                cur.execute("SELECT id, name, slug FROM categories;")
                for row in cur.fetchall():
                    print(f"    ID: {row[0]:<2} | Nombre: {row[1]:<20} | Slug: {row[2]}")

            # 3. Show products
            if "products" in tables:
                print("\n[*] Tabla 'products' (primeros 5):")
                cur.execute("SELECT id, name, price, stock, is_active FROM products LIMIT 5;")
                for row in cur.fetchall():
                    print(f"    ID: {row[0]:<2} | {row[1]:<30} | S/.{row[2]:<8.2f} | Stock: {row[3]:<3} | Activo: {row[4]}")

            # 4. Show users
            if "users" in tables:
                print("\n[*] Tabla 'users':")
                cur.execute("SELECT id, email, full_name, role, is_active FROM users;")
                for row in cur.fetchall():
                    print(f"    ID: {row[0]:<2} | {row[1]:<25} | {row[2]:<20} | Rol: {row[3]:<8} | Activo: {row[4]}")

            # 5. Show orders
            if "orders" in tables:
                print("\n[*] Tabla 'orders':")
                cur.execute("SELECT id, order_number, customer_name, total_amount, status, created_at FROM orders;")
                orders = cur.fetchall()
                if orders:
                    for row in orders:
                        print(f"    ID: {row[0]:<2} | Orden: {row[1]:<22} | Cliente: {row[2]:<20} | Total: S/.{row[3]:<8.2f} | Estado: {row[4]}")
                else:
                    print("    (Sin órdenes registradas todavía)")

    print("\n" + "=" * 60)
    print("  [OK] Conexión y consulta exitosa con AWS RDS.")
    print("=" * 60)

if __name__ == "__main__":
    inspect_database()
