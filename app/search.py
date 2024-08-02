from elasticsearch import Elasticsearch
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import os
from datetime import datetime, timedelta
from dateutil import parser
import re

router = APIRouter()

# Initialize Elasticsearch client
es = Elasticsearch([os.getenv("ELASTICSEARCH_URL", "http://elasticsearch:9200")])

def parse_date_query(query):
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Check for relative date queries
    relative_date_patterns = {
        r"today": today,
        r"yesterday": today - timedelta(days=1),
        r"last week": today - timedelta(weeks=1),
        r"last month": today.replace(day=1) - timedelta(days=1),
        r"this month": today.replace(day=1),
        r"this year": today.replace(month=1, day=1),
        r"last year": today.replace(year=today.year-1, month=1, day=1),
    }

    for pattern, date in relative_date_patterns.items():
        if re.search(pattern, query, re.IGNORECASE):
            return date

    # Check for "last X days/weeks/months/years" pattern
    last_x_pattern = r"last (\d+) (day|week|month|year)s?"
    match = re.search(last_x_pattern, query, re.IGNORECASE)
    if match:
        num = int(match.group(1))
        unit = match.group(2).lower()
        if unit == "day":
            return today - timedelta(days=num)
        elif unit == "week":
            return today - timedelta(weeks=num)
        elif unit == "month":
            return today.replace(day=1) - timedelta(days=num*30)  # Approximate
        elif unit == "year":
            return today.replace(year=today.year-num, month=1, day=1)

    # Try to parse as a specific date
    try:
        return parser.parse(query, fuzzy=True).replace(hour=0, minute=0, second=0, microsecond=0)
    except ValueError:
        return None

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

        # Define fields by type
        text_fields = [
            "asset_type^3", "serial_number^3", "manufacturer^2",
            "site_id^2", "site_name^2", "site_type", "operating_system",
            "os_version", "power_supply", "ip_address^2", "dns_name",
            "mac_address^2", "firmware_revision", "asset_status^2",
            "responsible_department", "primary_contact_person",
            "backup_contact_person", "criticality^2"
        ]

        numeric_fields = ["id", "expected_lifespan", "purchase_cost", "depreciation_value", "risk_assessment_score"]

        date_fields = [
            "installation_date", "last_maintenance_date",
            "next_scheduled_maintenance", "modified_date"
        ]

        # Parse the query for different types
        date_query = parse_date_query(query)

        # Try to parse the query as a number
        try:
            numeric_query = float(query)
        except ValueError:
            numeric_query = None

        should_clauses = [
            {
                "multi_match": {
                    "query": query,
                    "fields": text_fields,
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            },
            {
                "wildcard": {
                    "serial_number.keyword": f"*{query.lower()}*"
                }
            },
            {
                "wildcard": {
                    "ip_address.keyword": f"*{query.lower()}*"
                }
            },
            {
                "wildcard": {
                    "mac_address.keyword": f"*{query.lower()}*"
                }
            }
        ]

        # Add numeric queries
        if numeric_query is not None:
            for field in numeric_fields:
                should_clauses.append({
                    "term": {
                        field: numeric_query
                    }
                })

        # Add date range queries
        if date_query:
            for field in date_fields:
                should_clauses.append({
                    "range": {
                        field: {
                            "gte": date_query.strftime("%Y-%m-%d"),
                            "lte": (date_query + timedelta(days=1)).strftime("%Y-%m-%d"),
                            "format": "yyyy-MM-dd"
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
                "fields": {
                    "asset_type": {},
                    "serial_number": {},
                    "manufacturer": {},
                    "site_name": {},
                    "ip_address": {},
                    "mac_address": {},
                    "asset_status": {},
                    "criticality": {}
                }
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