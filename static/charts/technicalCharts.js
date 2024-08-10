// technicalCharts.js

import { getDistinctColors, getColorForAssetType } from './colorUtils.js';

export function renderOSDistributionChart(ctx, assetData) {
    const osDistribution = assetData.reduce((acc, asset) => {
        const os = asset.operating_system || 'Unknown';
        acc[os] = (acc[os] || 0) + 1;
        return acc;
    }, {});

    const sortedData = Object.entries(osDistribution)
        .sort((a, b) => b[1] - a[1]);

    const labels = sortedData.map(item => item[0]);
    const data = sortedData.map(item => item[1]);

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: getDistinctColors(labels.map(os => `os:${os}`))
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

export function renderFirmwareVersionsChart(ctx, assetData) {
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
        backgroundColor: getDistinctColors([`firmware:${version}`])[0]
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

export function renderPowerSupplyTypesChart(ctx, assetData) {
    const powerSupplyTypes = assetData.reduce((acc, asset) => {
        const powerSupply = asset.power_supply || 'Unknown';
        acc[powerSupply] = (acc[powerSupply] || 0) + 1;
        return acc;
    }, {});

    const sortedData = Object.entries(powerSupplyTypes)
        .sort((a, b) => b[1] - a[1]);

    const labels = sortedData.map(item => item[0]);
    const data = sortedData.map(item => item[1]);

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: getDistinctColors(labels.map(type => `powerSupply:${type}`))
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