const tintColorLight = '#10B981'; // Green theme
const tintColorDark = '#fff';

export const LightColors = {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#fff',
    cardBackground: '#f9f9f9',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#10B981',  // Green theme
    danger: '#ef4444',
    border: '#e5e5e5',
};

export const DarkColors = {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    cardBackground: '#1c1c1e',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#10B981',  // Green theme
    danger: '#ef4444',
    border: '#333',
};

export default {
    light: LightColors,
    dark: DarkColors,
    // Default fallback for direct imports
    primary: '#10B981',  // Green theme
    text: '#11181C',
    textSecondary: '#687076',
    background: '#fff',
    cardBackground: '#f9f9f9',
    danger: '#ef4444',
    border: '#e5e5e5',
};
