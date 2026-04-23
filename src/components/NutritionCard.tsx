import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NutritionInfo } from '../types';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS, GLASS } from '../constants/theme';

interface NutritionCardProps {
    nutrition: NutritionInfo;
    expanded?: boolean;
    onToggle?: () => void;
}

interface NutrientRowProps {
    label: string;
    value?: number;
    unit: string;
    dailyValue?: number;
    max?: number;
    isGood?: boolean;
}

const NutrientIndicator: React.FC<NutrientRowProps> = ({
    label,
    value,
    unit,
    dailyValue,
    max = 100,
    isGood,
}) => {
    if (value === undefined || value === null) return null;

    const percentage = Math.min((value / max) * 100, 100);
    const barColor = isGood === true ? COLORS.excellent : isGood === false ? COLORS.poor : COLORS.primary;

    return (
        <View style={styles.nutrientItem}>
            <View style={styles.nutrientTop}>
                <Text style={styles.nutrientLabel}>{label}</Text>
                <View style={styles.nutrientAmount}>
                    <Text style={styles.nutrientValue}>{value.toFixed(1)}{unit}</Text>
                    {dailyValue !== undefined && dailyValue > 0 && (
                        <Text style={styles.dvText}>{dailyValue}%</Text>
                    )}
                </View>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
            </View>
        </View>
    );
};

export const NutritionCard: React.FC<NutritionCardProps> = ({
    nutrition,
    expanded = false,
    onToggle,
}) => {
    const [isExpanded, setIsExpanded] = React.useState(expanded);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
        onToggle?.();
    };

    const getDailyValue = (value?: number, dailyNeed?: number) => {
        if (!value || !dailyNeed) return undefined;
        return Math.round((value / dailyNeed) * 100);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.header} onPress={handleToggle} activeOpacity={0.8}>
                <View style={styles.headerLeft}>
                    <View style={styles.iconBox}>
                        <Ionicons name="nutrition" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Nutritional Quality</Text>
                </View>
                <View style={styles.headerRight}>
                    {nutrition.calories !== undefined && (
                        <View style={styles.caloriesBadge}>
                            <Text style={styles.caloriesValue}>{Math.round(nutrition.calories)}</Text>
                            <Text style={styles.caloriesUnit}>kcal</Text>
                        </View>
                    )}
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={COLORS.textMuted}
                    />
                </View>
            </TouchableOpacity>

            {!isExpanded && (
                <View style={styles.macroRow}>
                    <View style={styles.compactMacro}>
                        <Text style={styles.compactMacroValue}>{nutrition.protein?.toFixed(0) || 0}g</Text>
                        <Text style={styles.compactMacroLabel}>Protein</Text>
                    </View>
                    <View style={styles.compactMacro}>
                        <Text style={styles.compactMacroValue}>{nutrition.carbohydrates?.toFixed(0) || 0}g</Text>
                        <Text style={styles.compactMacroLabel}>Carbs</Text>
                    </View>
                    <View style={styles.compactMacro}>
                        <Text style={styles.compactMacroValue}>{nutrition.fat?.toFixed(0) || 0}g</Text>
                        <Text style={styles.compactMacroLabel}>Fat</Text>
                    </View>
                </View>
            )}

            {isExpanded && (
                <View style={styles.expandedContent}>
                    <Text style={styles.analysisLabel}>Deep Analysis (per 100g)</Text>

                    <NutrientIndicator
                        label="Calories"
                        value={nutrition.calories}
                        unit=" kcal"
                        max={800}
                        dailyValue={getDailyValue(nutrition.calories, 2000)}
                    />

                    <NutrientIndicator
                        label="Protein"
                        value={nutrition.protein}
                        unit="g"
                        max={50}
                        isGood={nutrition.protein !== undefined && nutrition.protein >= 8}
                    />

                    <NutrientIndicator
                        label="Fiber"
                        value={nutrition.fiber}
                        unit="g"
                        max={15}
                        isGood={nutrition.fiber !== undefined && nutrition.fiber >= 3}
                    />

                    <NutrientIndicator
                        label="Total Sugars"
                        value={nutrition.sugars}
                        unit="g"
                        max={50}
                        isGood={nutrition.sugars !== undefined && nutrition.sugars < 5}
                    />

                    <NutrientIndicator
                        label="Saturated Fat"
                        value={nutrition.saturatedFat}
                        unit="g"
                        max={20}
                        isGood={nutrition.saturatedFat !== undefined && nutrition.saturatedFat < 1.5}
                    />

                    <NutrientIndicator
                        label="Sodium / Salt"
                        value={nutrition.salt || (nutrition.sodium ? nutrition.sodium / 1000 : undefined)}
                        unit="g"
                        max={6}
                        isGood={nutrition.salt !== undefined && nutrition.salt < 0.3}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.bgCard,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    caloriesBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: COLORS.bgSecondary,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    caloriesValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    caloriesUnit: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        marginLeft: 2,
        fontWeight: FONT_WEIGHT.medium,
    },
    macroRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingVertical: SPACING.md,
    },
    compactMacro: {
        flex: 1,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
    },
    compactMacroValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    compactMacroLabel: {
        fontSize: 10,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    expandedContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
    },
    analysisLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        fontWeight: FONT_WEIGHT.bold,
        letterSpacing: 1,
        marginBottom: SPACING.lg,
    },
    nutrientItem: {
        marginBottom: SPACING.lg,
    },
    nutrientTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    nutrientLabel: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.medium,
    },
    nutrientAmount: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    nutrientValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    dvText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: COLORS.bgSecondary,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
});

export default NutritionCard;
