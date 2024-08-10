// locationCharts.js

import { getDistinctColors } from './colorUtils.js';

export function renderSiteAreaChart(ctx, assetData) {
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
        backgroundColor: getDistinctColors([`area:${area}`])[0]
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

export function renderSiteTypeChart(ctx, assetData) {
    const siteTypes = assetData.reduce((acc, asset) => {
        acc[asset.site_type] = (acc[asset.site_type] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(siteTypes);
    const data = Object.values(siteTypes);

    return new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: getDistinctColors(labels.map(type => `siteType:${type}`))
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

export function renderProcessAreaChart(ctx, assetData) {
    const processAreas = [...new Set(assetData.map(asset => asset.process_area))];
    const siteNames = [...new Set(assetData.map(asset => asset.site_name))];

    const datasets = processAreas.map(area => {
        return {
            label: area,
            data: siteNames.map(site =>
                assetData.filter(asset => asset.site_name === site && asset.process_area === area).length
            ),
            backgroundColor: getDistinctColors([`processArea:${area}`])[0]
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