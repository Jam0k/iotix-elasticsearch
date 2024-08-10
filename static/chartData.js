// chartData.js

// Import all chart rendering functions from their respective modules
import * as identificationCharts from './charts/identificationCharts.js';
import * as locationCharts from './charts/locationCharts.js';
import * as technicalCharts from './charts/technicalCharts.js';
import * as networkCharts from './charts/networkCharts.js';
import * as maintenanceCharts from './charts/maintenanceCharts.js';
import * as financialCharts from './charts/financialCharts.js';
import * as statusCharts from './charts/statusCharts.js';
import * as responsibilityCharts from './charts/responsibilityCharts.js';

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

    document.querySelectorAll('#assetInfoTabs .nav-link, #assetInfoTabs .dropdown-item').forEach(tab => {
        tab.addEventListener('click', (event) => {
            let categoryId = event.target.id;
            currentCategory = categoryId.split('-')[2];
            currentChartIndex = 0;
            renderCurrentChart();
        });
    });
}

function prepareCharts() {
    charts = {
        identification: [
            { title: 'Asset Type Distribution', render: identificationCharts.renderAssetTypeChart },
            { title: 'Top 10 Manufacturers', render: identificationCharts.renderTopManufacturersChart },
            { title: 'Product Range Distribution', render: identificationCharts.renderProductRangeChart }
        ],
        location: [
            { title: 'Assets by Site and Area', render: locationCharts.renderSiteAreaChart },
            { title: 'Site Type Distribution', render: locationCharts.renderSiteTypeChart },
            { title: 'Process Areas by Site', render: locationCharts.renderProcessAreaChart }
        ],
        technical: [
            { title: 'Operating System Distribution', render: technicalCharts.renderOSDistributionChart },
            { title: 'Firmware Versions', render: technicalCharts.renderFirmwareVersionsChart },
            { title: 'Power Supply Types', render: technicalCharts.renderPowerSupplyTypesChart }
        ],
        network: [
            { title: 'Network Zone Distribution', render: networkCharts.renderNetworkZoneChart },
            { title: 'Cybersecurity Patch Status', render: networkCharts.renderCybersecurityPatchChart },
            { title: 'Risk Assessment Score Distribution', render: networkCharts.renderRiskAssessmentChart }
        ],
        maintenance: [
            { title: 'Maintenance Schedule Timeline', render: maintenanceCharts.renderMaintenanceScheduleChart },
            { title: 'Warranty Expiration Distribution', render: maintenanceCharts.renderWarrantyExpirationChart },
            { title: 'Support Contract Status', render: maintenanceCharts.renderSupportContractChart }
        ],
        financial: [
            { title: 'Purchase Cost vs Depreciation Value', render: financialCharts.renderPurchaseVsDepreciationChart },
            { title: 'Expected Lifespan Distribution', render: financialCharts.renderLifespanDistributionChart },
            { title: 'Top 10 Most Expensive Assets', render: financialCharts.renderTopExpensiveAssetsChart }
        ],
        status: [
            { title: 'Asset Status Distribution', render: statusCharts.renderAssetStatusChart },
            { title: 'Criticality Levels', render: statusCharts.renderCriticalityLevelsChart },
            { title: 'Obsolescence vs Criticality', render: statusCharts.renderObsolescenceCriticalityChart }
        ],
        responsibility: [
            { title: 'Responsible Department Distribution', render: responsibilityCharts.renderResponsibleDepartmentChart },
            { title: 'Compliance Requirements Breakdown', render: responsibilityCharts.renderComplianceRequirementsChart },
            { title: 'Primary Contact Person Workload', render: responsibilityCharts.renderContactPersonWorkloadChart }
        ]
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
        return;
    }

    const chartInfo = charts[currentCategory][currentChartIndex];
    document.getElementById('chartTitle').textContent = chartInfo.title;

    const ctx = document.getElementById('chartCanvas').getContext('2d');
    if (window.currentChart instanceof Chart) {
        window.currentChart.destroy();
    }
    window.currentChart = chartInfo.render(ctx, assetData);
}

document.addEventListener('DOMContentLoaded', initCharts);

export { initCharts };