import os
import time
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, text, inspect
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from app.search import router as search_router  # Updated import statement

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def create_tables(engine):
    with engine.connect() as connection:
        connection.execute(text("""
        CREATE TABLE IF NOT EXISTS assets (
            id SERIAL PRIMARY KEY,
            asset_type VARCHAR(50),
            serial_number VARCHAR(100),
            part_no VARCHAR(100),
            product_range VARCHAR(100),
            card_type VARCHAR(100),
            part_description TEXT,
            manufacturer VARCHAR(100),
            site_id VARCHAR(50),
            site_name VARCHAR(100),
            area VARCHAR(100),
            site_type VARCHAR(50),
            mcc_no VARCHAR(50),
            mcc_location VARCHAR(100),
            process_area VARCHAR(100),
            physical_location_coordinates VARCHAR(100),
            secure_location BOOLEAN,
            firmware_revision VARCHAR(50),
            software_compiler VARCHAR(50),
            operating_system VARCHAR(50),
            os_version VARCHAR(50),
            power_supply VARCHAR(50),
            ip_address VARCHAR(15),
            dns_name VARCHAR(100),
            mac_address VARCHAR(17),
            communication_protocols TEXT,
            remote_access BOOLEAN,
            syslog BOOLEAN,
            network_zone VARCHAR(50),
            cybersecurity_patch_status VARCHAR(50),
            last_vulnerability_scan_date DATE,
            risk_assessment_score NUMERIC(3,1),
            data_classification VARCHAR(50),
            installation_date DATE,
            last_maintenance_date DATE,
            next_scheduled_maintenance DATE,
            warranty_expiration_date DATE,
            change_management TEXT,
            vendor_support_contract VARCHAR(100),
            support_contract_expiration DATE,
            backup_frequency VARCHAR(50),
            purchase_cost NUMERIC(10,2),
            depreciation_value NUMERIC(10,2),
            expected_lifespan INTEGER,
            asset_status VARCHAR(50),
            obsolete BOOLEAN,
            criticality VARCHAR(50),
            responsible_department VARCHAR(100),
            primary_contact_person VARCHAR(100),
            backup_contact_person VARCHAR(100),
            compliance_requirements TEXT,from app.database import get_db

            id SERIAL PRIMARY KEY,
            asset_id INTEGER REFERENCES assets(id),
            change_type VARCHAR(50),
            change_description TEXT,
            changed_by VARCHAR(100),
            change_date DATE
        );
        """))
        connection.commit()

def table_exists(engine, table_name):
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()

def init_db():
    max_retries = 5
    retry_interval = 5  # seconds

    for attempt in range(max_retries):
        try:
            engine = create_engine(DATABASE_URL)
            if not table_exists(engine, 'assets'):
                create_tables(engine)
                print("Tables created successfully")
            else:
                print("Tables already exist")
            return
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                print("Max retries reached. Could not initialize database.")
                raise

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

# Mount the static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include the search router
app.include_router(search_router)

@app.get("/")
async def root():
    return FileResponse("static/index.html")
