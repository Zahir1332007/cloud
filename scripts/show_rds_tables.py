import os
import sys
from sqlalchemy import inspect, text

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.core.database import engine


def inspect_database():
    dialect = engine.dialect.name.upper()
    print("=" * 60)
    print(f"  {dialect} - Inspección de Tablas y Registros")
    print("=" * 60)

    inspector = inspect(engine)
    tables = sorted(inspector.get_table_names())

    with engine.connect() as conn:
        print(f"\n[+] Tablas encontradas en la BD ({len(tables)}):")
        for table in tables:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            print(f"    - {table:<20} -> {count} registros")

        print("\n" + "=" * 60)
        print("  Detalle de Contenido:")
        print("=" * 60)

        if "categories" in tables:
            print("\n[*] Tabla 'categories':")
            for row in conn.execute(text("SELECT id, name, slug FROM categories")).fetchall():
                print(f"    ID: {row[0]:<2} | Nombre: {row[1]:<24} | Slug: {row[2]}")

        if "products" in tables:
            print("\n[*] Tabla 'products' (primeros 5):")
            for row in conn.execute(
                text("SELECT id, name, price, stock, is_active FROM products LIMIT 5")
            ).fetchall():
                print(
                    f"    ID: {row[0]:<2} | {row[1]:<38} | S/.{float(row[2]):<8.2f} | Stock: {row[3]:<3} | Activo: {bool(row[4])}"
                )

        if "users" in tables:
            print("\n[*] Tabla 'users':")
            for row in conn.execute(
                text("SELECT id, email, full_name, role, is_active FROM users")
            ).fetchall():
                print(
                    f"    ID: {row[0]:<2} | {row[1]:<25} | {row[2]:<24} | Rol: {row[3]:<8} | Activo: {bool(row[4])}"
                )

        if "orders" in tables:
            print("\n[*] Tabla 'orders':")
            orders = conn.execute(
                text("SELECT id, order_number, customer_name, total_amount, status FROM orders")
            ).fetchall()
            if orders:
                for row in orders:
                    print(
                        f"    ID: {row[0]:<2} | Orden: {row[1]:<20} | Cliente: {row[2]:<22} | Total: S/.{float(row[3]):<8.2f} | Estado: {row[4]}"
                    )
            else:
                print("    (Sin órdenes registradas todavía)")

    print("\n" + "=" * 60)
    print(f"  [OK] Conexión y consulta exitosa ({dialect}).")
    print("=" * 60)


if __name__ == "__main__":
    inspect_database()
