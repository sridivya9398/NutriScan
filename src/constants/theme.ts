// NutriScan Design System
export const COLORS = {
    // Primary brand colors
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',

    // Health score colors
    excellent: '#22C55E',
    good: '#84CC16',
    mediocre: '#EAB308',
    poor: '#EF4444',

    // Background colors (Dark Mode - Richer blacks)
    bgPrimary: '#050505',
    bgSecondary: '#0F0F0F',
    bgCard: '#171717',
    bgCardLight: '#222222',

    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',

    // UI colors
    border: '#27272A',
    borderLight: '#3F3F46',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Status colors
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    success: '#22C55E',
};

export const GLASS = {
    white: 'rgba(255, 255, 255, 0.08)',
    whiteLight: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.12)',
};

export const GRADIENTS = {
    premium: ['#10B981', '#059669'],
    card: ['#1C1C1C', '#141414'],
    glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

export const FONT_SIZE = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 48,
    giant: 64,
};

export const FONT_WEIGHT = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

export const BORDER_RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 18,
    xl: 28,
    xxl: 40,
    full: 9999,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 12,
    },
};

// Health score helper
export const getScoreColor = (score: number): string => {
    if (score >= 75) return COLORS.excellent;
    if (score >= 50) return COLORS.good;
    if (score >= 25) return COLORS.mediocre;
    return COLORS.poor;
};

export const getScoreLabel = (score: number): string => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Mediocre';
    return 'Poor';
};

export const getLetterGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C+';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D+';
    if (score >= 30) return 'D';
    return 'F';
};

