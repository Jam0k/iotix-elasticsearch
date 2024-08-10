// colorUtils.js

// Define your theme colors
const themeColors = {
    primary: '#2C3E50',
    secondary: '#325985',
    accent: '#0A5C54',
    alert: '#FFC857',
    white: '#FDFFFC'
};

// Function to generate a color palette based on a base color
function generateColorPalette(baseColor, count) {
    const palette = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 137.508) % 360; // Use golden angle approximation
        const saturation = 50 + Math.random() * 10; // 50-60%
        const lightness = 40 + Math.random() * 20; // 40-60%
        palette.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return palette;
}

// Generate a large palette of colors based on theme
const extendedPalette = [
    ...Object.values(themeColors),
    ...generateColorPalette(themeColors.primary, 20),
    ...generateColorPalette(themeColors.secondary, 20),
    ...generateColorPalette(themeColors.accent, 20)
];

// Object to store consistent color mappings
const colorMap = {};

// Function to get a consistent color for a given key
function getConsistentColor(key) {
    if (!colorMap[key]) {
        colorMap[key] = extendedPalette[Object.keys(colorMap).length % extendedPalette.length];
    }
    return colorMap[key];
}

export function getColorForAssetType(assetType) {
    return getConsistentColor(`assetType:${assetType}`);
}

export function getColorForCriticality(criticality) {
    const colorMap = {
        'Low': '#4A7C59',  // Green
        'Medium': themeColors.alert,  // Amber
        'High': '#C3423F',  // Red
        'Critical': '#9B2226',  // Dark Red
        'Unknown': '#B9B9B9'  // Grey
    };
    return colorMap[criticality] || getConsistentColor(`criticality:${criticality}`);
}

// Function to get an array of distinct colors
export function getDistinctColors(keys) {
    return keys.map(key => getConsistentColor(key));
}