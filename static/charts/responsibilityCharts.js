// responsibilityCharts.js

import { getDistinctColors } from './colorUtils.js';

export function renderResponsibleDepartmentChart(ctx, assetData) {
    const departmentDistribution = assetData.reduce((acc, asset) => {
        const department = asset.responsible_department || 'Unknown';
        acc[department] = (acc[department] || 0) + 1;
        return acc;
    }, {});

    const sortedData = Object.entries(departmentDistribution)
        .sort((a, b) => b[1] - a[1]);

    const labels = sortedData.map(item => item[0]);
    const data = sortedData.map(item => item[1]);

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: getDistinctColors(labels.map(dept => `department:${dept}`))
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Responsible Department Distribution'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

export function renderComplianceRequirementsChart(ctx, assetData) {
    const complianceData = assetData.reduce((acc, asset) => {
        const requirements = asset.compliance_requirements ? asset.compliance_requirements.split(', ') : ['Unknown'];
        const assetType = asset.asset_type || 'Unknown';
        if (!acc[assetType]) acc[assetType] = {};
        requirements.forEach(req => {
            acc[assetType][req] = (acc[assetType][req] || 0) + 1;
        });
        return acc;
    }, {});

    const assetTypes = Object.keys(complianceData);
    const complianceTypes = [...new Set(assetData.flatMap(asset => 
        asset.compliance_requirements ? asset.compliance_requirements.split(', ') : ['Unknown']
    ))];

    const datasets = complianceTypes.map(compliance => ({
        label: compliance,
        data: assetTypes.map(type => complianceData[type][compliance] || 0),
        backgroundColor: getDistinctColors([`compliance:${compliance}`])[0]
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
                    text: 'Compliance Requirements by Asset Type'
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

export function renderContactPersonWorkloadChart(ctx, assetData) {
    const contactWorkload = assetData.reduce((acc, asset) => {
        const contact = asset.primary_contact_person || 'Unknown';
        acc[contact] = (acc[contact] || 0) + 1;
        return acc;
    }, {});

    const sortedData = Object.entries(contactWorkload)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);  // Get top 10 contacts

    const labels = sortedData.map(item => item[0]);
    const data = sortedData.map(item => item[1]);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Assets',
                data: data,
                backgroundColor: getDistinctColors(labels.map(contact => `contact:${contact}`))
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Primary Contact Person Workload'
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
                        text: 'Number of Assets'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Primary Contact Person'
                    }
                }
            }
        }
    });
}