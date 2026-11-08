#!/usr/bin/env python3
"""
CloudStore Automated Smoke Test Suite
Verifies that the API and database are fully operational locally or on AWS EC2.
Usage:
    python scripts/smoke_test.py [BASE_URL]
Example:
    python scripts/smoke_test.py http://localhost:8000
    python scripts/smoke_test.py http://54.210.120.45
"""

import sys
import time
import requests

DEFAULT_URL = "http://localhost:8000"
BASE_URL = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else DEFAULT_URL

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"


def print_step(name: str):
    print(f"\n{BLUE}[TEST]{RESET} {name}...", end=" ", flush=True)


def print_ok(extra: str = ""):
    print(f"{GREEN}✓ OK{RESET} {extra}")


def print_fail(error: str):
    print(f"{RED}✗ FAILED{RESET}: {error}")


def run_smoke_tests():
    print(f"{YELLOW}======================================================{RESET}")
    print(f"  Iniciando Smoke Tests de CloudStore en: {BASE_URL}")
    print(f"{YELLOW}======================================================{RESET}")

    session = requests.Session()
    total_passed = 0
    total_failed = 0

    # 1. Health Check
    print_step("1. Health Check & Database Connection (/api/v1/health)")
    try:
        t0 = time.time()
        res = session.get(f"{BASE_URL}/api/v1/health", timeout=10)
        ms = int((time.time() - t0) * 1000)
        if res.status_code == 200 and res.json().get("status") == "healthy":
            print_ok(f"({ms}ms) [Database: {res.json().get('database')}]")
            total_passed += 1
        else:
            print_fail(f"HTTP {res.status_code} - {res.text}")
            total_failed += 1
    except Exception as e:
        print_fail(str(e))
        total_failed += 1

    # 2. Categories
    print_step("2. Listado de Categorías (/api/v1/categories)")
    try:
        res = session.get(f"{BASE_URL}/api/v1/categories", timeout=10)
        if res.status_code == 200 and len(res.json()) > 0:
            print_ok(f"({len(res.json())} categorías encontradas)")
            total_passed += 1
        else:
            print_fail(f"HTTP {res.status_code}")
            total_failed += 1
    except Exception as e:
        print_fail(str(e))
        total_failed += 1

    # 3. Products
    print_step("3. Catálogo de Productos y Paginación (/api/v1/products)")
    first_product_id = None
    try:
        res = session.get(f"{BASE_URL}/api/v1/products?size=6", timeout=10)
        if res.status_code == 200:
            data = res.json()
            items = data.get("items", [])
            total = data.get("total", 0)
            if items:
                first_product_id = items[0]["id"]
            print_ok(f"({len(items)} productos obtenidos de {total} totales)")
            total_passed += 1
        else:
            print_fail(f"HTTP {res.status_code}")
            total_failed += 1
    except Exception as e:
        print_fail(str(e))
        total_failed += 1

    # 4. Auth - Admin Login
    print_step("4. Autenticación JWT de Administrador (/api/v1/auth/login)")
    admin_token = None
    try:
        res = session.post(f"{BASE_URL}/api/v1/auth/login", json={
            "email": "admin@cloudstore.com",
            "password": "Admin123!"
        }, timeout=10)
        if res.status_code == 200 and "access_token" in res.json():
            admin_token = res.json()["access_token"]
            print_ok(f"(Token JWT emitido para {res.json()['email']})")
            total_passed += 1
        else:
            print_fail(f"HTTP {res.status_code} - {res.text}")
            total_failed += 1
    except Exception as e:
        print_fail(str(e))
        total_failed += 1

    # 5. Order Creation (Simulated Checkout)
    print_step("5. Creación de Orden y Transacción Atómica (/api/v1/orders)")
    created_order_number = None
    try:
        if first_product_id:
            payload = {
                "customer_name": "Test Evaluador Cloud",
                "customer_email": "evaluador@unas.edu.pe",
                "shipping_address": "Campus Universitario UNAS, Tingo María",
                "phone": "+51 900 000 000",
                "payment_method": "credit_card",
                "items": [{"product_id": first_product_id, "quantity": 1}]
            }
            res = session.post(f"{BASE_URL}/api/v1/orders", json=payload, timeout=10)
            if res.status_code == 201:
                created_order_number = res.json().get("order_number")
                print_ok(f"(Orden creada con éxito: {created_order_number})")
                total_passed += 1
            else:
                print_fail(f"HTTP {res.status_code} - {res.text}")
                total_failed += 1
        else:
            print_fail("No hay productos disponibles para probar la orden.")
            total_failed += 1
    except Exception as e:
        print_fail(str(e))
        total_failed += 1

    # 6. Track Order
    if created_order_number:
        print_step(f"6. Rastreo de Orden (/api/v1/orders/track/{created_order_number})")
        try:
            res = session.get(f"{BASE_URL}/api/v1/orders/track/{created_order_number}", timeout=10)
            if res.status_code == 200:
                print_ok(f"(Estado en base de datos: {res.json().get('status')})")
                total_passed += 1
            else:
                print_fail(f"HTTP {res.status_code}")
                total_failed += 1
        except Exception as e:
            print_fail(str(e))
            total_failed += 1

    # 7. Admin Metrics Dashboard
    if admin_token:
        print_step("7. Acceso a Métricas Administrativas con JWT (/api/v1/stats/dashboard)")
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            res = session.get(f"{BASE_URL}/api/v1/stats/dashboard", headers=headers, timeout=10)
            if res.status_code == 200:
                stats = res.json()
                print_ok(f"(Ventas Totales: ${stats.get('total_revenue')}, Órdenes: {stats.get('total_orders')})")
                total_passed += 1
            else:
                print_fail(f"HTTP {res.status_code}")
                total_failed += 1
        except Exception as e:
            print_fail(str(e))
            total_failed += 1

    # Summary
    print(f"\n{YELLOW}======================================================{RESET}")
    print(f"  Resumen de Pruebas: {GREEN}{total_passed} APROBADAS{RESET} | {RED}{total_failed} FALLIDAS{RESET}")
    print(f"{YELLOW}======================================================{RESET}")

    if total_failed == 0:
        print(f"{GREEN}¡Todos los servicios e infraestructura Cloud están 100% operativos!{RESET}\n")
        return 0
    else:
        print(f"{RED}Se detectaron fallos en algunos endpoints. Revisa los logs de arriba.{RESET}\n")
        return 1


if __name__ == "__main__":
    sys.exit(run_smoke_tests())

