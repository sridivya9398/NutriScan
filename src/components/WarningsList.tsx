import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Additive, Warning } from '../types';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, GLASS } from '../constants/theme';

interface WarningsListProps {
    warnings: Warning[];
    additives?: Additive[];
    allergens?: string[];
    userAllergens?: string[];
}

export const WarningsList: React.FC<WarningsListProps> = ({
    warnings,
    additives = [],
    allergens = [],
    userAllergens = [],
}) => {
    const [expandedSection, setExpandedSection] = React.useState<string | null>('warnings');

    const getSeverityColor = (severity: Warning['severity']) => {
        switch (severity) {
            case 'danger': return COLORS.error;
            case 'warning': return COLORS.warning;
            default: return COLORS.info;
        }
    };

    const getSeverityIcon = (severity: Warning['severity']): keyof typeof Ionicons.glyphMap => {
        switch (severity) {
            case 'danger': return 'alert-circle';
            case 'warning': return 'warning';
            default: return 'information-circle';
        }
    };

    const getRiskColor = (risk: Additive['riskLevel']) => {
        switch (risk) {
            case 'high': return COLORS.error;
            case 'moderate': return COLORS.warning;
            case 'low': return COLORS.excellent;
            default: return COLORS.textMuted;
        }
    };

    const matchedAllergens = allergens.filter(a =>
        userAllergens.some(ua => a.toLowerCase().includes(ua.toLowerCase()))
    );

    const renderWarning = (warning: Warning, index: number) => (
        <View key={index} style={styles.warningItem}>
            <View style={[styles.statusIndicator, { backgroundColor: getSeverityColor(warning.severity) }]} />
            <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>{warning.title}</Text>
                <Text style={styles.warningDescription}>{warning.description}</Text>
            </View>
            <Ionicons name={getSeverityIcon(warning.severity)} size={20} color={getSeverityColor(warning.severity)} />
        </View>
    );

    const renderAdditive = (additive: Additive, index: number) => (
        <View key={index} style={styles.additiveItem}>
            <View style={styles.additiveMain}>
                <View style={[styles.additiveCodeBadge, { backgroundColor: getRiskColor(additive.riskLevel) + '15' }]}>
                    <Text style={[styles.additiveCodeText, { color: getRiskColor(additive.riskLevel) }]}>
                        {additive.code}
                    </Text>
                </View>
                <View style={styles.additiveInfo}>
                    <Text style={styles.additiveName}>{additive.name}</Text>
                    <View style={styles.riskRow}>
                        <View style={[styles.riskDot, { backgroundColor: getRiskColor(additive.riskLevel) }]} />
                        <Text style={[styles.riskLabel, { color: getRiskColor(additive.riskLevel) }]}>
                            {additive.riskLevel.charAt(0).toUpperCase() + additive.riskLevel.slice(1)} Risk
                        </Text>
                    </View>
                </View>
            </View>
            {additive.concerns && additive.concerns.length > 0 && (
                <View style={styles.concernsContainer}>
                    {additive.concerns.map((concern, i) => (
                        <View key={i} style={styles.concernRow}>
                            <View style={styles.bullet} />
                            <Text style={styles.concernText}>{concern}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const renderSectionHeader = (title: string, key: string, count: number, icon: keyof typeof Ionicons.glyphMap, color: string) => {
        const isExpanded = expandedSection === key;
        return (
            <TouchableOpacity
                style={[styles.sectionHeader, isExpanded && styles.sectionHeaderExpanded]}
                onPress={() => setExpandedSection(isExpanded ? null : key)}
                activeOpacity={0.8}
            >
                <View style={styles.sectionHeaderLeft}>
                    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                        <Ionicons name={icon} size={20} color={color} />
                    </View>
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <View style={styles.sectionHeaderRight}>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{count}</Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={COLORS.textMuted}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Urgent Allergen Alert */}
            {matchedAllergens.length > 0 && (
                <View style={styles.allergenAlert}>
                    <View style={styles.alertIconBg}>
                        <Ionicons name="warning" size={24} color={COLORS.error} />
                    </View>
                    <View style={styles.alertMain}>
                        <Text style={styles.alertTitle}>Allergen Warning</Text>
                        <Text style={styles.alertDesc}>
                            This product contains <Text style={styles.bold}>{matchedAllergens.join(', ')}</Text> which matches your profile.
                        </Text>
                    </View>
                </View>
            )}

            {/* Health Concerns */}
            {warnings.length > 0 && (
                <View style={styles.premiumSection}>
                    {renderSectionHeader('Health Analysis', 'warnings', warnings.length, 'shield-half', COLORS.warning)}
                    {expandedSection === 'warnings' && (
                        <View style={styles.sectionContent}>
                            {warnings.map(renderWarning)}
                        </View>
                    )}
                </View>
            )}

            {/* Additives */}
            {additives.length > 0 && (
                <View style={styles.premiumSection}>
                    {renderSectionHeader('Additives', 'additives', additives.length, 'flask', COLORS.info)}
                    {expandedSection === 'additives' && (
                        <View style={styles.sectionContent}>
                            {additives.map(renderAdditive)}
                        </View>
                    )}
                </View>
            )}

            {/* Clear State */}
            {warnings.length === 0 && additives.length === 0 && matchedAllergens.length === 0 && (
                <View style={styles.allClearCard}>
                    <View style={styles.clearIconBg}>
                        <Ionicons name="shield-checkmark" size={40} color={COLORS.excellent} />
                    </View>
                    <Text style={styles.clearTitle}>Excellent Choice</Text>
                    <Text style={styles.clearText}>No harmful additives or health concerns detected.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
        gap: SPACING.md,
    },
    premiumSection: {
        backgroundColor: COLORS.bgCard,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
    },
    sectionHeaderExpanded: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    sectionHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    countBadge: {
        backgroundColor: COLORS.bgSecondary,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    countText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textSecondary,
    },
    sectionContent: {
        padding: SPACING.lg,
    },
    warningItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgSecondary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusIndicator: {
        width: 4,
        height: '80%',
        borderRadius: 2,
        marginRight: SPACING.md,
    },
    warningContent: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    warningTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    warningDescription: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    additiveItem: {
        backgroundColor: COLORS.bgSecondary,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    additiveMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    additiveCodeBadge: {
        width: 50,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    additiveCodeText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold,
    },
    additiveInfo: {
        flex: 1,
    },
    additiveName: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    riskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    riskDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    riskLabel: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
    },
    concernsContainer: {
        marginTop: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    concernRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    bullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.textMuted,
        marginRight: 8,
    },
    concernText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
    },
    allergenAlert: {
        flexDirection: 'row',
        backgroundColor: COLORS.error + '10',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.error + '30',
        alignItems: 'center',
        gap: SPACING.md,
    },
    alertIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.error + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertMain: {
        flex: 1,
    },
    alertTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.error,
    },
    alertDesc: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
        lineHeight: 20,
    },
    bold: {
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    allClearCard: {
        alignItems: 'center',
        padding: SPACING.xxl,
        backgroundColor: COLORS.bgCard,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    clearIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.excellent + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    clearTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.excellent,
    },
    clearText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 24,
    },
});

export default WarningsList;
