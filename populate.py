import os
import random
from datetime import date, datetime, timedelta
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from faker import Faker

load_dotenv()

DATABASE_URL = 'postgresql://iotix:iotixpassword@localhost:5432/iotix'
fake = Faker()

def populate_sample_data():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        # Check if the assets table is empty
        result = connection.execute(text("SELECT COUNT(*) FROM assets"))
        count = result.scalar()
        
        if count == 0:
            # Generate and insert 100 sample assets
            for _ in range(100):
                asset = {
                    "asset_type": random.choice(["Server", "Router", "Switch", "Firewall", "PLC", "HMI"]),
                    "serial_number": fake.unique.uuid4(),
                    "part_no": fake.bothify(text='PN-####-????'),
                    "product_range": fake.word(ext_word_list=["Enterprise", "Industrial", "Commercial", "Residential"]),
                    "card_type": fake.word(ext_word_list=["Network", "CPU", "Memory", "Storage", "N/A"]),
                    "part_description": fake.sentence(),
                    "manufacturer": fake.company(),
                    "site_id": fake.bothify(text='SITE-###'),
                    "site_name": fake.city(),
                    "area": fake.word(ext_word_list=["Production", "Office", "Warehouse", "Data Center"]),
                    "site_type": fake.word(ext_word_list=["Main", "Branch", "Remote"]),
                    "mcc_no": fake.bothify(text='MCC-###'),
                    "mcc_location": fake.street_address(),
                    "process_area": fake.word(ext_word_list=["Manufacturing", "Assembly", "Packaging", "Quality Control"]),
                    "physical_location_coordinates": f"{fake.latitude()}, {fake.longitude()}",
                    "secure_location": random.choice([True, False]),
                    "firmware_revision": fake.bothify(text='v#.#.#'),
                    "software_compiler": fake.word(ext_word_list=["GCC", "MSVC", "Clang", "N/A"]),
                    "operating_system": fake.word(ext_word_list=["Windows", "Linux", "macOS", "Proprietary"]),
                    "os_version": fake.bothify(text='v##.##'),
                    "power_supply": fake.word(ext_word_list=["AC", "DC", "PoE"]),
                    "ip_address": fake.ipv4(),
                    "dns_name": fake.domain_name(),
                    "mac_address": fake.mac_address(),
                    "communication_protocols": ", ".join(random.sample(["HTTP", "HTTPS", "FTP", "SSH", "Telnet", "SNMP", "Modbus", "Profinet"], k=random.randint(1, 4))),
                    "remote_access": random.choice([True, False]),
                    "syslog": random.choice([True, False]),
                    "network_zone": fake.word(ext_word_list=["DMZ", "Internal", "External", "Restricted"]),
                    "cybersecurity_patch_status": fake.word(ext_word_list=["Up to date", "Pending", "Critical update required"]),
                    "last_vulnerability_scan_date": fake.date_between(start_date="-1y", end_date="today"),
                    "risk_assessment_score": round(random.uniform(1, 10), 1),
                    "data_classification": fake.word(ext_word_list=["Public", "Internal", "Confidential", "Restricted"]),
                    "installation_date": fake.date_between(start_date="-5y", end_date="today"),
                    "last_maintenance_date": fake.date_between(start_date="-1y", end_date="today"),
                    "next_scheduled_maintenance": fake.date_between(start_date="today", end_date="+1y"),
                    "warranty_expiration_date": fake.date_between(start_date="today", end_date="+5y"),
                    "change_management": fake.paragraph(),
                    "vendor_support_contract": fake.company(),
                    "support_contract_expiration": fake.date_between(start_date="today", end_date="+3y"),
                    "backup_frequency": fake.word(ext_word_list=["Daily", "Weekly", "Monthly", "Real-time"]),
                    "purchase_cost": round(random.uniform(1000, 100000), 2),
                    "depreciation_value": round(random.uniform(100, 10000), 2),
                    "expected_lifespan": random.randint(3, 10),
                    "asset_status": fake.word(ext_word_list=["Active", "Inactive", "Maintenance", "Decommissioned"]),
                    "obsolete": random.choice([True, False]),
                    "criticality": fake.word(ext_word_list=["High", "Medium", "Low"]),
                    "responsible_department": fake.word(ext_word_list=["IT", "OT", "Maintenance", "Production"]),
                    "primary_contact_person": fake.name(),
                    "backup_contact_person": fake.name(),
                    "compliance_requirements": ", ".join(random.sample(["GDPR", "HIPAA", "PCI DSS", "ISO 27001", "NIST"], k=random.randint(1, 3))),
                    "custom_configurations": fake.paragraph(),
                    "connected_devices": ", ".join([fake.word() for _ in range(random.randint(1, 5))]),
                    "failure_history": fake.paragraph(),
                    "created_date": fake.date_between(start_date="-5y", end_date="today"),
                    "modified_date": fake.date_between(start_date="-1y", end_date="today")
                }

                result = connection.execute(
                    text("""
                    INSERT INTO assets (
                        asset_type, serial_number, part_no, product_range, card_type, part_description,
                        manufacturer, site_id, site_name, area, site_type, mcc_no, mcc_location,
                        process_area, physical_location_coordinates, secure_location, firmware_revision,
                        software_compiler, operating_system, os_version, power_supply, ip_address,
                        dns_name, mac_address, communication_protocols, remote_access, syslog,
                        network_zone, cybersecurity_patch_status, last_vulnerability_scan_date,
                        risk_assessment_score, data_classification, installation_date, last_maintenance_date,
                        next_scheduled_maintenance, warranty_expiration_date, change_management,
                        vendor_support_contract, support_contract_expiration, backup_frequency,
                        purchase_cost, depreciation_value, expected_lifespan, asset_status, obsolete,
                        criticality, responsible_department, primary_contact_person, backup_contact_person,
                        compliance_requirements, custom_configurations, connected_devices, failure_history,
                        created_date, modified_date
                    ) VALUES (
                        :asset_type, :serial_number, :part_no, :product_range, :card_type, :part_description,
                        :manufacturer, :site_id, :site_name, :area, :site_type, :mcc_no, :mcc_location,
                        :process_area, :physical_location_coordinates, :secure_location, :firmware_revision,
                        :software_compiler, :operating_system, :os_version, :power_supply, :ip_address,
                        :dns_name, :mac_address, :communication_protocols, :remote_access, :syslog,
                        :network_zone, :cybersecurity_patch_status, :last_vulnerability_scan_date,
                        :risk_assessment_score, :data_classification, :installation_date, :last_maintenance_date,
                        :next_scheduled_maintenance, :warranty_expiration_date, :change_management,
                        :vendor_support_contract, :support_contract_expiration, :backup_frequency,
                        :purchase_cost, :depreciation_value, :expected_lifespan, :asset_status, :obsolete,
                        :criticality, :responsible_department, :primary_contact_person, :backup_contact_person,
                        :compliance_requirements, :custom_configurations, :connected_devices, :failure_history,
                        :created_date, :modified_date
                    ) RETURNING id
                    """),
                    asset
                )
                asset_id = result.fetchone()[0]

                # Generate 1-5 history records for each asset
                for _ in range(random.randint(1, 5)):
                    history = {
                        "asset_id": asset_id,
                        "change_type": fake.word(ext_word_list=["Update", "Maintenance", "Relocation", "Configuration"]),
                        "change_description": fake.paragraph(),
                        "changed_by": fake.name(),
                        "change_date": fake.date_time_between(start_date="-1y", end_date="now")
                    }

                    connection.execute(
                        text("""
                        INSERT INTO asset_history (
                            asset_id, change_type, change_description, changed_by, change_date
                        ) VALUES (
                            :asset_id, :change_type, :change_description, :changed_by, :change_date
                        )
                        """),
                        history
                    )

            connection.commit()
            print("Sample data inserted successfully")
        else:
            print("Assets table is not empty, skipping sample data insertion")

if __name__ == "__main__":
    populate_sample_data()