// networkCharts.js

import { getDistinctColors, getColorForCriticality } from './colorUtils.js';

export function renderNetworkZoneChart(ctx, assetData) {
    const networkZones = assetData.reduce((acc, asset) => {
        const zone = asset.network_zone || 'Unknown';
        acc[zone] = (acc[zone] || 0) + 1;
        return acc;
    }, {});

    const sortedData = Object.entries(networkZones)
        .sort((a, b) => b[1] - a[1]);

    const labels = sortedData.map(item => item[0]);
    const data = sortedData.map(item => item[1]);

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: getDistinctColors(labels.map(zone => `networkZone:${zone}`))
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

export function renderCybersecurityPatchChart(ctx, assetData) {
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
        backgroundColor: getColorForCriticality(status)
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

export function renderRiskAssessmentChart(ctx, assetData) {
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

    const labels = bins.map(bin => `${bin.start.toFixed(1)} - ${bin.end.toFixed(1)}`);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Assets',
                data: bins.map(bin => bin.count),
                backgroundColor: getDistinctColors(labels.map(label => `riskBin:${label}`))
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