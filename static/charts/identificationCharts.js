// identificationCharts.js

import { getColorForAssetType, getDistinctColors } from './colorUtils.js';

export function renderAssetTypeChart(ctx, assetData) {
    const assetTypes = assetData.reduce((acc, asset) => {
        acc[asset.asset_type] = (acc[asset.asset_type] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(assetTypes);
    const data = Object.values(assetTypes);

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map(getColorForAssetType)
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

export function renderTopManufacturersChart(ctx, assetData) {
    const manufacturers = assetData.reduce((acc, asset) => {
        acc[asset.manufacturer] = (acc[asset.manufacturer] || 0) + 1;
        return acc;
    }, {});

    const sortedManufacturers = Object.entries(manufacturers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const labels = sortedManufacturers.map(m => m[0]);
    const data = sortedManufacturers.map(m => m[1]);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Assets',
                data: data,
                backgroundColor: getDistinctColors(labels.map(label => `manufacturer:${label}`))
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

export function renderProductRangeChart(ctx, assetData) {
    const productRanges = assetData.reduce((acc, asset) => {
        acc[asset.product_range] = (acc[asset.product_range] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(productRanges);
    const data = Object.values(productRanges);

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: getDistinctColors(labels.map(label => `productRange:${label}`))
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