// financialCharts.js

import { getColorForAssetType, getDistinctColors } from './colorUtils.js';

export function renderPurchaseVsDepreciationChart(ctx, assetData) {
    const data = assetData
        .filter(asset => asset.purchase_cost != null && asset.depreciation_value != null)
        .map(asset => ({
            x: asset.purchase_cost,
            y: asset.depreciation_value,
            assetType: asset.asset_type
        }));

    const uniqueAssetTypes = [...new Set(data.map(item => item.assetType))];

    return new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: uniqueAssetTypes.map(assetType => ({
                label: assetType,
                data: data.filter(item => item.assetType === assetType),
                backgroundColor: getColorForAssetType(assetType)
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Purchase Cost vs Depreciation Value'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return `${point.assetType}: ($${point.x}, $${point.y})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Purchase Cost ($)'
                    },
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    title: {
                        display: true,
                        text: 'Depreciation Value ($)'
                    }
                }
            }
        }
    });
}

export function renderLifespanDistributionChart(ctx, assetData) {
    const lifespans = assetData
        .filter(asset => asset.expected_lifespan != null)
        .map(asset => asset.expected_lifespan);

    // Calculate the bins for the histogram
    const binCount = 10;
    const min = Math.min(...lifespans);
    const max = Math.max(...lifespans);
    const binSize = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => {
        const start = min + i * binSize;
        const end = start + binSize;
        return {
            start: start,
            end: end,
            count: lifespans.filter(lifespan => lifespan >= start && lifespan < end).length
        };
    });

    const labels = bins.map(bin => `${bin.start.toFixed(1)} - ${bin.end.toFixed(1)} years`);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Assets',
                data: bins.map(bin => bin.count),
                backgroundColor: getDistinctColors(labels.map(label => `lifespan:${label}`))
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Expected Lifespan Distribution'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Expected Lifespan (years)'
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

export function renderTopExpensiveAssetsChart(ctx, assetData) {
    const sortedAssets = assetData
        .filter(asset => asset.purchase_cost != null)
        .sort((a, b) => b.purchase_cost - a.purchase_cost)
        .slice(0, 10);

    const labels = sortedAssets.map(asset => `${asset.asset_type} (ID: ${asset.id})`);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Purchase Cost',
                data: sortedAssets.map(asset => asset.purchase_cost),
                backgroundColor: sortedAssets.map(asset => getColorForAssetType(asset.asset_type))
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Most Expensive Assets'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Purchase Cost ($)'
                    }
                }
            }
        }
    });
}