import requests

def check_elasticsearch():
    try:
        response = requests.get("http://localhost:9200")
        if response.status_code == 200:
            print("Elasticsearch is running.")
            
            # Check cluster health
            health = requests.get("http://localhost:9200/_cluster/health").json()
            print(f"Cluster status: {health['status']}")
            
            # Check indices
            indices = requests.get("http://localhost:9200/_cat/indices?format=json").json()
            print(f"Number of indices: {len(indices)}")
            for index in indices:
                print(f"Index: {index['index']}, Docs count: {index['docs.count']}")
        else:
            print("Elasticsearch is not responding correctly.")
    except requests.ConnectionError:
        print("Could not connect to Elasticsearch.")

def check_logstash():
    try:
        response = requests.get("http://localhost:9600")
        if response.status_code == 200:
            print("Logstash is running.")
            
            # Check node stats
            stats = requests.get("http://localhost:9600/_node/stats").json()
            print(f"Logstash version: {stats['version']}")
            print(f"JVM heap used: {stats['jvm']['mem']['heap_used_percent']}%")
            
            # Check pipelines
            pipelines = requests.get("http://localhost:9600/_node/pipelines").json()
            for pipeline in pipelines['pipelines']:
                print(f"Pipeline: {pipeline}")
                print(f"Events in: {pipelines['pipelines'][pipeline]['events']['in']}")
                print(f"Events out: {pipelines['pipelines'][pipeline]['events']['out']}")
        else:
            print("Logstash is not responding correctly.")
    except requests.ConnectionError:
        print("Could not connect to Logstash.")

if __name__ == "__main__":
    print("Checking Elasticsearch:")
    check_elasticsearch()
    print("\nChecking Logstash:")
    check_logstash()