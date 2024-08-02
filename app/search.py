from elasticsearch import Elasticsearch
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import os
from datetime import datetime
import re

router = APIRouter()

# Initialize Elasticsearch client
es = Elasticsearch([os.getenv("ELASTICSEARCH_URL", "http://elasticsearch:9200")])

def parse_date_query(query):
    # Check for year
    year_match = re.match(r'^(\d{4})$', query)
    if year_match:
        year = year_match.group(1)
        return f"{year}", f"{year}-12-31"

    # Check for year and month
    year_month_match = re.match(r'^(\d{4})-(\d{1,2})$', query)
    if year_month_match:
        year, month = year_month_match.groups()
        start_date = f"{year}-{month.zfill(2)}-01"
        end_date = (datetime.strptime(start_date, "%Y-%m-%d").replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        return start_date, end_date.strftime("%Y-%m-%d")

    # Check for full date
    full_date_match = re.match(r'^(\d{4})-(\d{1,2})-(\d{1,2})$', query)
    if full_date_match:
        year, month, day = full_date_match.groups()
        date = f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        return date, date

    return None, None

@router.get("/search")
async def search_assets(
    query: str = Query(..., description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Number of results per page"),
    sort_field: str = Query("criticality.keyword", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)")
):
    try:
        from_index = (page - 1) * size

        # Define all searchable fields
        searchable_fields = [
            "card_type", "cybersecurity_patch_status", "communication_protocols",
            "manufacturer", "dns_name", "site_name", "site_type", "asset_status",
            "ip_address", "operating_system", "mcc_no", "serial_number", "connected_devices",
            "os_version", "physical_location_coordinates", "mac_address", "data_classification",
            "software_compiler", "firmware_revision", "backup_frequency", "backup_contact_person",
            "failure_history", "part_description", "responsible_department", "criticality",
            "site_id", "process_area", "power_supply", "custom_configurations", "product_range",
            "change_management", "vendor_support_contract", "asset_type", "network_zone",
            "primary_contact_person", "compliance_requirements", "part_no", "mcc_location", "area"
        ]

        # Fields that should be searched with .keyword for exact matches
        keyword_fields = [
            "card_type", "manufacturer", "site_name", "site_type", "asset_status",
            "operating_system", "mcc_no", "data_classification", "backup_frequency",
            "responsible_department", "criticality", "site_id", "process_area",
            "power_supply", "product_range", "asset_type", "network_zone", "part_no"
        ]

        # Date fields
        date_fields = [
            "next_scheduled_maintenance", "warranty_expiration_date", "support_contract_expiration",
            "modified_date", "installation_date", "last_vulnerability_scan_date",
            "created_date", "last_maintenance_date"
        ]

        # Construct the query
        should_clauses = [
            {
                "multi_match": {
                    "query": query,
                    "fields": [f"{field}^1" for field in searchable_fields if field not in keyword_fields] +
                              [f"{field}.keyword^2" for field in keyword_fields],
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            }
        ]

        # Add exact match queries for specific fields
        for field in ["serial_number", "ip_address", "mac_address"]:
            should_clauses.append({
                "term": {
                    f"{field}.keyword": query.lower()
                }
            })

        # Handle date queries
        start_date, end_date = parse_date_query(query)
        if start_date and end_date:
            for date_field in date_fields:
                should_clauses.append({
                    "range": {
                        date_field: {
                            "gte": start_date,
                            "lte": end_date
                        }
                    }
                })

        body = {
            "query": {
                "bool": {
                    "should": should_clauses
                }
            },
            "from": from_index,
            "size": size,
            "sort": [{sort_field: {"order": sort_order}}],
            "highlight": {
                "fields": {field: {} for field in searchable_fields + date_fields}
            },
            "aggs": {
                "asset_types": {"terms": {"field": "asset_type.keyword"}},
                "manufacturers": {"terms": {"field": "manufacturer.keyword"}},
                "sites": {"terms": {"field": "site_name.keyword"}},
                "criticality": {"terms": {"field": "criticality.keyword"}}
            }
        }

        result = es.search(index="assets", body=body)
        
        hits = result['hits']['hits']
        assets = [
            {
                "id": hit["_id"],
                "score": hit["_score"],
                "highlight": hit.get("highlight", {}),
                **hit["_source"]
            } for hit in hits
        ]

        return {
            "total": result['hits']['total']['value'],
            "assets": assets,
            "aggregations": result.get("aggregations", {}),
            "page": page,
            "size": size,
            "total_pages": (result['hits']['total']['value'] + size - 1) // size
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during search: {str(e)}")