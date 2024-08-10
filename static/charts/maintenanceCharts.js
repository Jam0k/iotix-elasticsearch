// maintenanceCharts.js

import { getDistinctColors } from './colorUtils.js';

export function renderMaintenanceScheduleChart(ctx, assetData) {
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
        type: 'scatter',
        data: {
            labels: labels,
            datasets: [{
                label: 'Next Scheduled Maintenance',
                data: data,
                backgroundColor: getDistinctColors(sortedAssets.map(asset => `maintenanceAsset:${asset.id}`))[0]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Maintenance Schedule Timeline (Next 20 Events)'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const dataPoint = sortedAssets[context.dataIndex];
                            return label + ': ' + dataPoint.asset_type + ' (' + dataPoint.id + ') - ' + new Date(dataPoint.next_scheduled_maintenance).toLocaleDateString();
                        }
                    }
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
                    },
                    ticks: {
                        callback: function(value, index) {
                            return sortedAssets[index] ? sortedAssets[index].asset_type : '';
                        }
                    }
                }
            }
        }
    });
}

export function renderWarrantyExpirationChart(ctx, assetData) {
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

    const labels = Object.keys(warrantyStatus);
    const data = Object.values(warrantyStatus);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Assets',
                data: data,
                backgroundColor: getDistinctColors(labels.map(status => `warrantyStatus:${status}`))
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

export function renderSupportContractChart(ctx, assetData) {
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

    const labels = Object.keys(contractStatus);
    const data = Object.values(contractStatus);

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: getDistinctColors(labels.map(status => `contractStatus:${status}`))
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