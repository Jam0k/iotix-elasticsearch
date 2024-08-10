// statusCharts.js

import { getDistinctColors, getColorForCriticality, getColorForAssetType } from './colorUtils.js';

export function renderAssetStatusChart(ctx, assetData) {
    const statusDistribution = assetData.reduce((acc, asset) => {
        const status = asset.asset_status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const sortedData = Object.entries(statusDistribution)
        .sort((a, b) => b[1] - a[1]);

    const labels = sortedData.map(item => item[0]);
    const data = sortedData.map(item => item[1]);

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: getDistinctColors(labels.map(status => `assetStatus:${status}`))
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Asset Status Distribution'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

export function renderCriticalityLevelsChart(ctx, assetData) {
    const criticalityLevels = assetData.reduce((acc, asset) => {
        const criticality = asset.criticality || 'Unknown';
        const assetType = asset.asset_type || 'Unknown';
        if (!acc[assetType]) acc[assetType] = {};
        acc[assetType][criticality] = (acc[assetType][criticality] || 0) + 1;
        return acc;
    }, {});

    const assetTypes = Object.keys(criticalityLevels);
    const criticalityTypes = ['Low', 'Medium', 'High', 'Critical', 'Unknown'];

    const datasets = criticalityTypes.map(criticality => ({
        label: criticality,
        data: assetTypes.map(type => criticalityLevels[type][criticality] || 0),
        backgroundColor: getColorForCriticality(criticality)
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
                    text: 'Criticality Levels by Asset Type'
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

export function renderObsolescenceCriticalityChart(ctx, assetData) {
    const criticalityMapping = {
        'Low': 1,
        'Medium': 2,
        'High': 3,
        'Critical': 4
    };

    const data = assetData
        .filter(asset => asset.criticality && asset.obsolete !== undefined)
        .map(asset => ({
            x: criticalityMapping[asset.criticality] || 0,
            y: asset.obsolete ? 1 : 0,
            r: asset.risk_assessment_score * 2 || 5,  // Using risk score for bubble size, default to 5 if not available
            assetType: asset.asset_type
        }));

    return new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Assets',
                data: data,
                backgroundColor: data.map(item => getColorForAssetType(item.assetType))
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Obsolescence vs Criticality'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return `${point.assetType}: (Criticality: ${Object.keys(criticalityMapping)[point.x-1]}, Obsolete: ${point.y === 1 ? 'Yes' : 'No'}, Risk Score: ${point.r/2})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Criticality'
                    },
                    ticks: {
                        callback: function(value) {
                            return Object.keys(criticalityMapping)[value-1] || '';
                        }
                    },
                    min: 0,
                    max: 5
                },
                y: {
                    title: {
                        display: true,
                        text: 'Obsolescence'
                    },
                    ticks: {
                        callback: function(value) {
                            return value === 0 ? 'No' : 'Yes';
                        }
                    },
                    min: -0.5,
                    max: 1.5
                }
            }
        }
    });
}