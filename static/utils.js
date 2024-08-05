export function getAssetTypeIcon(assetType) {
    const iconMap = {
        'PLC': 'fas fa-microchip',
        'Server': 'fas fa-server',
        'Router': 'fas fa-router',
        'Switch': 'fas fa-network-wired',
        'Workstation': 'fas fa-desktop',
        'Printer': 'fas fa-print',
        'Camera': 'fas fa-video',
        'Sensor': 'fas fa-thermometer-half',
        'Mobile Device': 'fas fa-mobile-alt',
        'Firewall': 'fas fa-shield-alt',
        'Storage': 'fas fa-hdd',
        'VPN': 'fas fa-lock',
        'Access Point': 'fas fa-wifi',
        'IoT Device': 'fas fa-microchip',
        'SCADA': 'fas fa-industry'
    };
    return iconMap[assetType] || 'fas fa-cube';
}

export function getAssetTypeIconClass(assetType) {
    const classMap = {
        'PLC': 'bg-plc',
        'Server': 'bg-server',
        'Router': 'bg-router',
        'Switch': 'bg-switch',
        'Workstation': 'bg-workstation',
        'Printer': 'bg-printer',
        'Camera': 'bg-camera',
        'Sensor': 'bg-sensor',
        'Mobile Device': 'bg-mobile',
        'Firewall': 'bg-firewall',
        'Storage': 'bg-storage',
        'VPN': 'bg-vpn',
        'Access Point': 'bg-access-point',
        'IoT Device': 'bg-iot',
        'SCADA': 'bg-scada'
    };
    return classMap[assetType] || 'bg-default';
}

export function getCriticalityClass(criticality) {
    const classMap = {
        'Low': 'criticality-low',
        'Medium': 'criticality-medium',
        'High': 'criticality-high',
        'Critical': 'criticality-critical',
    };
    return classMap[criticality] || '';
}

export function getMatchedField(asset) {
    const excludeFields = ['id', 'criticality'];
    const query = this.query.toLowerCase();

    for (const [key, value] of Object.entries(asset)) {
        if (excludeFields.includes(key)) continue;
        if (value && value.toString().toLowerCase().includes(query)) {
            const label = key.split(/(?=[A-Z])|_/).map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
            return `${label}: ${value}`;
        }
    }
    return null;
}