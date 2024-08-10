let currentChartIndex = 0;
let currentCategory = 'identification';
let charts = {};
let assetData = [];

function initCharts() {
    prepareCharts(); 
    fetchChartData();
    setupEventListeners();
}

function fetchChartData() {
    fetch('/advanced-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            criteria: [],
            boolean_options: {},
            custom_query: null,
            page: 1,
            size: 1000,
            sort_field: "criticality.keyword",
            sort_order: "desc"
        })
    })
        .then(response => response.json())
        .then(data => {
            assetData = data.assets;
            renderCurrentChart();
        })
        .catch(error => console.error('Error fetching chart data:', error));
}


function setupEventListeners() {
    document.getElementById('prevChart').addEventListener('click', () => navigateChart(-1));
    document.getElementById('nextChart').addEventListener('click', () => navigateChart(1));

    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.addEventListener('click', (event) => {
            currentCategory = event.target.id.split('-')[2];
            currentChartIndex = 0;
            renderCurrentChart();
        });
    });
}

function prepareCharts() {
    charts = {
        identification: [
            { title: 'Asset Type Distribution', render: renderAssetTypeChart },
            { title: 'Top 10 Manufacturers', render: renderTopManufacturersChart },
            { title: 'Product Range Distribution', render: renderProductRangeChart }
        ],
        location: [
            { title: 'Assets by Site and Area', render: renderSiteAreaChart },
            { title: 'Site Type Distribution', render: renderSiteTypeChart },
            { title: 'Process Areas by Site', render: renderProcessAreaChart }
        ],
        technical: [
            { title: 'Operating System Distribution', render: renderOSDistributionChart },
            { title: 'Firmware Versions', render: renderFirmwareVersionsChart },
            { title: 'Power Supply Types', render: renderPowerSupplyTypesChart }
        ],
        network: [
            { title: 'Network Zone Distribution', render: renderNetworkZoneChart },
            { title: 'Cybersecurity Patch Status', render: renderCybersecurityPatchChart },
            { title: 'Risk Assessment Score Distribution', render: renderRiskAssessmentChart }
        ],
        maintenance: [
            { title: 'Maintenance Schedule Timeline', render: renderMaintenanceScheduleChart },
            { title: 'Warranty Expiration Distribution', render: renderWarrantyExpirationChart },
            { title: 'Support Contract Status', render: renderSupportContractChart }
        ],
    };
}

function navigateChart(direction) {
    currentChartIndex += direction;
    if (currentChartIndex < 0) currentChartIndex = charts[currentCategory].length - 1;
    if (currentChartIndex >= charts[currentCategory].length) currentChartIndex = 0;
    renderCurrentChart();
}

function renderCurrentChart() {
    if (!charts[currentCategory] || charts[currentCategory].length === 0) {
        console.error(`No charts defined for category: ${currentCategory}`);
        return;
    }

    const chartInfo = charts[currentCategory][currentChartIndex];
    document.getElementById('chartTitle').textContent = chartInfo.title;

    const ctx = document.getElementById('chartCanvas').getContext('2d');
    if (window.currentChart instanceof Chart) {
        window.currentChart.destroy();
    }
    window.currentChart = chartInfo.render(ctx);
}

function renderAssetTypeChart(ctx) {
    const assetTypes = assetData.reduce((acc, asset) => {
        acc[asset.asset_type] = (acc[asset.asset_type] || 0) + 1;
        return acc;
    }, {});

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(assetTypes),
            datasets: [{
                data: Object.values(assetTypes),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Asset Type Distribution'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function renderTopManufacturersChart(ctx) {
    const manufacturers = assetData.reduce((acc, asset) => {
        acc[asset.manufacturer] = (acc[asset.manufacturer] || 0) + 1;
        return acc;
    }, {});

    const sortedManufacturers = Object.entries(manufacturers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedManufacturers.map(m => m[0]),
            datasets: [{
                label: 'Number of Assets',
                data: sortedManufacturers.map(m => m[1]),
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Manufacturers'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Assets'
                    }
                }
            }
        }
    });
}

function renderProductRangeChart(ctx) {
    const productRanges = assetData.reduce((acc, asset) => {
        acc[asset.product_range] = (acc[asset.product_range] || 0) + 1;
        return acc;
    }, {});

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(productRanges),
            datasets: [{
                data: Object.values(productRanges),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Product Range Distribution'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function renderSiteAreaChart(ctx) {
    const siteAreaData = assetData.reduce((acc, asset) => {
        if (!acc[asset.site_name]) {
            acc[asset.site_name] = {};
        }
        acc[asset.site_name][asset.area] = (acc[asset.site_name][asset.area] || 0) + 1;
        return acc;
    }, {});

    const sites = Object.keys(siteAreaData);
    const areas = [...new Set(assetData.map(asset => asset.area))];
    const datasets = areas.map(area => ({
        label: area,
        data: sites.map(site => siteAreaData[site][area] || 0),
        backgroundColor: getRandomColor()
    }));

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sites,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Assets by Site and Area'
                },
                legend: {
                    position: 'right'
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Sites'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Assets'
                    }
                }
            }
        }
    });
}

function renderSiteTypeChart(ctx) {
    const siteTypes = assetData.reduce((acc, asset) => {
        acc[asset.site_type] = (acc[asset.site_type] || 0) + 1;
        return acc;
    }, {});

    return new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(siteTypes),
            datasets: [{
                data: Object.values(siteTypes),
                backgroundColor: Object.keys(siteTypes).map(() => getRandomColor())
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Site Type Distribution'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function renderProcessAreaChart(ctx) {
    const processAreas = [...new Set(assetData.map(asset => asset.process_area))];
    const siteNames = [...new Set(assetData.map(asset => asset.site_name))];

    const datasets = processAreas.map(area => {
        return {
            label: area,
            data: siteNames.map(site =>
                assetData.filter(asset => asset.site_name === site && asset.process_area === area).length
            ),
            backgroundColor: getRandomColor()
        };
    });

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: siteNames,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Process Areas by Site'
                },
                legend: {
                    position: 'right'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Sites'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Assets'
                    }
                }
            }
        }
    });
}

function renderOSDistributionChart(ctx) {
    const osDistribution = assetData.reduce((acc, asset) => {
        const os = asset.operating_system || 'Unknown';
        acc[os] = (acc[os] || 0) + 1;
        return acc;
    }, {});

    const sortedData = Object.entries(osDistribution)
        .sort((a, b) => b[1] - a[1]);

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                data: sortedData.map(item => item[1]),
                backgroundColor: sortedData.map(() => getRandomColor())
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Operating System Distribution'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function renderFirmwareVersionsChart(ctx) {
    const firmwareData = assetData.reduce((acc, asset) => {
        const assetType = asset.asset_type || 'Unknown';
        const firmware = asset.firmware_revision || 'Unknown';
        if (!acc[assetType]) acc[assetType] = {};
        acc[assetType][firmware] = (acc[assetType][firmware] || 0) + 1;
        return acc;
    }, {});

    const assetTypes = Object.keys(firmwareData);
    const firmwareVersions = [...new Set(assetData.map(asset => asset.firmware_revision))];

    const datasets = firmwareVersions.map(version => ({
        label: version,
        data: assetTypes.map(type => firmwareData[type][version] || 0),
        backgroundColor: getRandomColor()
    }));

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: assetTypes,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Firmware Versions by Asset Type'
                },
                legend: {
                    position: 'right'
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Asset Types'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Assets'
                    }
                }
            }
        }
    });
}

function renderPowerSupplyTypesChart(ctx) {
    const powerSupplyTypes = assetData.reduce((acc, asset) => {
        const powerSupply = asset.power_supply || 'Unknown';
        acc[powerSupply] = (acc[powerSupply] || 0) + 1;
        return acc;
    }, {});

    const sortedData = Object.entries(powerSupplyTypes)
        .sort((a, b) => b[1] - a[1]);

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                data: sortedData.map(item => item[1]),
                backgroundColor: sortedData.map(() => getRandomColor())
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Power Supply Types Distribution'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });

    
}

function renderNetworkZoneChart(ctx) {
    const networkZones = assetData.reduce((acc, asset) => {
        const zone = asset.network_zone || 'Unknown';
        acc[zone] = (acc[zone] || 0) + 1;
        return acc;
    }, {});

    const sortedData = Object.entries(networkZones)
        .sort((a, b) => b[1] - a[1]);

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                data: sortedData.map(item => item[1]),
                backgroundColor: sortedData.map(() => getRandomColor())
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Network Zone Distribution'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function renderCybersecurityPatchChart(ctx) {
    const patchStatus = assetData.reduce((acc, asset) => {
        const status = asset.cybersecurity_patch_status || 'Unknown';
        const assetType = asset.asset_type || 'Unknown';
        if (!acc[assetType]) acc[assetType] = {};
        acc[assetType][status] = (acc[assetType][status] || 0) + 1;
        return acc;
    }, {});

    const assetTypes = Object.keys(patchStatus);
    const statuses = [...new Set(assetData.map(asset => asset.cybersecurity_patch_status))];

    const datasets = statuses.map(status => ({
        label: status,
        data: assetTypes.map(type => patchStatus[type][status] || 0),
        backgroundColor: getRandomColor()
    }));

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: assetTypes,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Cybersecurity Patch Status by Asset Type'
                },
                legend: {
                    position: 'right'
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Asset Types'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Assets'
                    }
                }
            }
        }
    });
}

function renderRiskAssessmentChart(ctx) {
    const riskScores = assetData.map(asset => asset.risk_assessment_score).filter(score => score != null);
    
    // Calculate the bins for the histogram
    const binCount = 10;
    const min = Math.min(...riskScores);
    const max = Math.max(...riskScores);
    const binSize = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => {
        const start = min + i * binSize;
        const end = start + binSize;
        return {
            start: start,
            end: end,
            count: riskScores.filter(score => score >= start && score < end).length
        };
    });

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.map(bin => `${bin.start.toFixed(1)} - ${bin.end.toFixed(1)}`),
            datasets: [{
                label: 'Number of Assets',
                data: bins.map(bin => bin.count),
                backgroundColor: getRandomColor()
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Risk Assessment Score Distribution'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Risk Assessment Score'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Assets'
                    }
                }
            }
        }
    });
}
function renderMaintenanceScheduleChart(ctx) {
    // Sort assets by next scheduled maintenance date
    const sortedAssets = assetData
        .filter(asset => asset.next_scheduled_maintenance)
        .sort((a, b) => new Date(a.next_scheduled_maintenance) - new Date(b.next_scheduled_maintenance))
        .slice(0, 20);  // Take only the next 20 maintenance events

    const labels = sortedAssets.map(asset => asset.asset_type + ' (' + asset.id + ')');
    const data = sortedAssets.map(asset => ({
        x: new Date(asset.next_scheduled_maintenance),
        y: asset.id
    }));

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Next Scheduled Maintenance',
                data: data,
                borderColor: getRandomColor(),
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Maintenance Schedule Timeline (Next 20 Events)'
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Asset ID'
                    }
                }
            }
        }
    });
}

function renderWarrantyExpirationChart(ctx) {
    const currentDate = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(currentDate.getFullYear() + 1);

    const warrantyStatus = assetData.reduce((acc, asset) => {
        const expirationDate = new Date(asset.warranty_expiration_date);
        let status;
        if (expirationDate < currentDate) {
            status = 'Expired';
        } else if (expirationDate <= oneYearFromNow) {
            status = 'Expiring within 1 year';
        } else {
            status = 'Valid for more than 1 year';
        }
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(warrantyStatus),
            datasets: [{
                label: 'Number of Assets',
                data: Object.values(warrantyStatus),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Warranty Expiration Distribution'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Assets'
                    }
                }
            }
        }
    });
}

function renderSupportContractChart(ctx) {
    const contractStatus = assetData.reduce((acc, asset) => {
        let status;
        if (!asset.vendor_support_contract) {
            status = 'No Contract';
        } else if (new Date(asset.support_contract_expiration) < new Date()) {
            status = 'Expired';
        } else {
            status = 'Active';
        }
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(contractStatus),
            datasets: [{
                data: Object.values(contractStatus),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Support Contract Status'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}
// Utility function to generate random colors (if not already defined)
function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
}
document.addEventListener('DOMContentLoaded', initCharts);