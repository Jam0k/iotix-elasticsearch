// chartData.js

function initCharts() {
    fetchChartData();
}

function fetchChartData() {
    fetch('/advanced-search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            criteria: [],
            boolean_options: {},
            custom_query: null,
            page: 1,
            size: 0,  // We don't need actual assets, just aggregations
            sort_field: "criticality.keyword",
            sort_order: "desc"
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Received data:", data);  // Log the received data
        if (data.aggregations && data.aggregations.asset_types && data.aggregations.criticality) {
            const assetTypes = data.aggregations.asset_types.buckets;
            const criticality = data.aggregations.criticality.buckets;
            createAssetTypesChart(assetTypes);
            createAssetCriticalityChart(criticality);
        } else {
            console.error('Aggregations not found in the response:', data);
        }
    })
    .catch(error => {
        console.error('Error fetching chart data:', error);
        // Display an error message to the user
        document.getElementById('assetTypesChart').innerHTML = 'Error loading chart data';
        document.getElementById('assetCriticalityChart').innerHTML = 'Error loading chart data';
    });
}

function createAssetTypesChart(assetTypesData) {
    const ctx = document.getElementById('assetTypesChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: assetTypesData.map(item => item.key),
                datasets: [{
                    data: assetTypesData.map(item => item.doc_count),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                        '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Asset Types Distribution'
                    }
                }
            }
        });
    } else {
        console.error('Asset Types Chart container not found');
    }
}

function createAssetCriticalityChart(assetCriticalityData) {
    const ctx = document.getElementById('assetCriticalityChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: assetCriticalityData.map(item => item.key),
                datasets: [{
                    label: 'Asset Count',
                    data: assetCriticalityData.map(item => item.doc_count),
                    backgroundColor: '#36A2EB'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Asset Criticality Distribution'
                    }
                }
            }
        });
    } else {
        console.error('Asset Criticality Chart container not found');
    }
}

// Call initCharts when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCharts);