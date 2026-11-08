from decimal import Decimal
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.product import Category, Product
from app.models.order import Order, OrderItem, OrderStatus, PaymentMethod


def seed_database(db: Session = None):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # Ensure tables exist
        Base.metadata.create_all(bind=engine)

        # Check if already seeded
        existing_admin = db.query(User).filter(User.email == "admin@cloudstore.com").first()
        if existing_admin:
            print("Database already contains initial seed data.")
            return

        print("Seeding database with initial store data...")

        # 1. Create Default Users
        admin_user = User(
            email="admin@cloudstore.com",
            hashed_password=get_password_hash("Admin123!"),
            full_name="Administrador CloudStore",
            role=UserRole.ADMIN,
            is_active=True
        )

        customer_user = User(
            email="cliente@cloudstore.com",
            hashed_password=get_password_hash("Cliente123!"),
            full_name="Juan Perez Gomez",
            role=UserRole.CUSTOMER,
            is_active=True
        )

        db.add_all([admin_user, customer_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(customer_user)

        # 2. Create Categories
        categories_data = [
            Category(
                name="Laptops & Computadoras",
                slug="laptops-computadoras",
                description="Equipos portátiles de alto rendimiento para desarrollo, diseño y gaming.",
                image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
            ),
            Category(
                name="Smartphones & Tablets",
                slug="smartphones-tablets",
                description="Dispositivos móviles de última generación con cámaras pro y pantallas OLED.",
                image_url="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
            ),
            Category(
                name="Periféricos & Gaming",
                slug="perifericos-gaming",
                description="Teclados mecánicos, ratones ergonómicos y monitores ultra wide.",
                image_url="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80"
            ),
            Category(
                name="Audio & Auriculares",
                slug="audio-auriculares",
                description="Cancelación activa de ruido, sonido espacial y fidelidad de estudio.",
                image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
            )
        ]

        db.add_all(categories_data)
        db.commit()

        cat_map = {cat.slug: cat.id for cat in categories_data}

        # 3. Create Products
        products_data = [
            Product(
                name="MacBook Pro 16' M3 Max",
                slug="macbook-pro-16-m3-max",
                description="Potencia extrema para profesionales de software y arquitectura cloud. 36GB RAM unificada, 1TB SSD ultrarrápido y pantalla Liquid Retina XDR.",
                price=Decimal("2899.99"),
                stock=15,
                image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["laptops-computadoras"],
                is_active=True,
                rating=Decimal("4.95")
            ),
            Product(
                name="Dell XPS 15 OLED Touch",
                slug="dell-xps-15-oled-touch",
                description="Intel Core i9 14th Gen, 32GB DDR5, RTX 4070. Chasis de aluminio anodizado y pantalla 3.5K OLED con colores cinematográficos.",
                price=Decimal("2199.50"),
                stock=8,
                image_url="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["laptops-computadoras"],
                is_active=True,
                rating=Decimal("4.80")
            ),
            Product(
                name="ThinkPad X1 Carbon Gen 11",
                slug="thinkpad-x1-carbon-gen-11",
                description="El estándar dorado de ultrabooks empresariales y desarrolladores Linux. Teclado legendario, peso ultrapluma y certificación militar.",
                price=Decimal("1749.00"),
                stock=12,
                image_url="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["laptops-computadoras"],
                is_active=True,
                rating=Decimal("4.85")
            ),
            Product(
                name="iPhone 16 Pro Max 256GB",
                slug="iphone-16-pro-max-256gb",
                description="Construcción en titanio de grado aeroespacial, chip A18 Pro con Apple Intelligence y sistema de cámaras Pro con teleobjetivo 5x.",
                price=Decimal("1299.00"),
                stock=25,
                image_url="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["smartphones-tablets"],
                is_active=True,
                rating=Decimal("4.90")
            ),
            Product(
                name="Samsung Galaxy S24 Ultra",
                slug="samsung-galaxy-s24-ultra",
                description="Galaxy AI integrada, pantalla Dynamic AMOLED 2X plana antirreflejos de 120Hz, cámara de 200MP y S-Pen integrado.",
                price=Decimal("1199.99"),
                stock=20,
                image_url="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["smartphones-tablets"],
                is_active=True,
                rating=Decimal("4.88")
            ),
            Product(
                name="iPad Pro 13' M4 OLED",
                slug="ipad-pro-13-m4-oled",
                description="Increíblemente delgado con pantalla Ultra Retina XDR Tandem OLED. Máximo rendimiento gráfico para ilustración y productividad.",
                price=Decimal("1399.00"),
                stock=10,
                image_url="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["smartphones-tablets"],
                is_active=True,
                rating=Decimal("4.92")
            ),
            Product(
                name="Teclado Mecánico Custom Keychron Q1 Pro",
                slug="teclado-keychron-q1-pro",
                description="Cuerpo entero de aluminio mecanizado CNC, switches Gateron Jupiter Banano lubricados, conectividad inalámbrica Bluetooth y QMK/VIA.",
                price=Decimal("199.99"),
                stock=30,
                image_url="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["perifericos-gaming"],
                is_active=True,
                rating=Decimal("4.94")
            ),
            Product(
                name="Mouse Ergonómico Logitech MX Master 3S",
                slug="logitech-mx-master-3s",
                description="Clicks silenciosos, sensor Darkfield de 8000 DPI para tracking en cristal y rueda electromagnética MagSpeed ultra rápida.",
                price=Decimal("99.90"),
                stock=45,
                image_url="https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["perifericos-gaming"],
                is_active=True,
                rating=Decimal("4.97")
            ),
            Product(
                name="Monitor Curvo Samsung Odyssey Neo G9 49'",
                slug="monitor-samsung-odyssey-neo-g9",
                description="Resolución Dual QHD, tasa de refresco de 240Hz, Mini LED con HDR 2000 y curvatura envolvente 1000R para inmersión total.",
                price=Decimal("1499.00"),
                stock=4,
                image_url="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["perifericos-gaming"],
                is_active=True,
                rating=Decimal("4.75")
            ),
            Product(
                name="Sony WH-1000XM5 Noise Cancelling",
                slug="sony-wh-1000xm5-noise-cancelling",
                description="La mejor cancelación activa de ruido del mercado con dos procesadores y 8 micrófonos. 30 horas de batería y llamadas ultranítidas.",
                price=Decimal("349.99"),
                stock=18,
                image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["audio-auriculares"],
                is_active=True,
                rating=Decimal("4.91")
            ),
            Product(
                name="AirPods Pro (2da Generación USB-C)",
                slug="airpods-pro-2-usbc",
                description="Audio adaptativo con cancelación de ruido 2x más potente, modo ambiente inteligente y estuche con carga MagSafe y altavoz de rastreo.",
                price=Decimal("249.00"),
                stock=35,
                image_url="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["audio-auriculares"],
                is_active=True,
                rating=Decimal("4.89")
            ),
            Product(
                name="Micrófono Shure SM7B Broadcast",
                slug="microfono-shure-sm7b",
                description="Micrófono dinámico cardioide legendario para streaming, podcasts y grabación vocal profesional en estudio.",
                price=Decimal("399.00"),
                stock=9,
                image_url="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
                category_id=cat_map["audio-auriculares"],
                is_active=True,
                rating=Decimal("4.98")
            )
        ]

        db.add_all(products_data)
        db.commit()

        # 4. Create a Sample Demo Order
        sample_order = Order(
            order_number="ORD-20261108-DEMO01",
            user_id=customer_user.id,
            customer_name="Juan Perez Gomez",
            customer_email="cliente@cloudstore.com",
            shipping_address="Av. Universitaria 1234, Tingo María, Huánuco, Perú",
            phone="+51 987 654 321",
            total_amount=Decimal("1448.99"),
            status=OrderStatus.PAID,
            payment_method=PaymentMethod.CREDIT_CARD,
            items=[
                OrderItem(
                    product_id=products_data[3].id,
                    product_name=products_data[3].name,
                    quantity=1,
                    unit_price=products_data[3].price,
                    subtotal=products_data[3].price
                ),
                OrderItem(
                    product_id=products_data[7].id,
                    product_name=products_data[7].name,
                    quantity=1,
                    unit_price=products_data[7].price,
                    subtotal=products_data[7].price
                )
            ]
        )
        db.add(sample_order)
        db.commit()

        print("Database seeded successfully with demo users, catalog and initial order.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_database()

