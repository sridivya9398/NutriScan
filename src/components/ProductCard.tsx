import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, getScoreColor, GLASS, SHADOWS } from '../constants/theme';

interface ProductCardProps {
    product: Product;
    onPress?: () => void;
    variant?: 'compact' | 'full';
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onPress,
    variant = 'full',
}) => {
    const scoreColor = getScoreColor(product.healthScore);

    const getNutriScoreColor = (grade?: string) => {
        const colors: Record<string, string> = {
            a: '#038141',
            b: '#85BB2F',
            c: '#FECB02',
            d: '#EE8100',
            e: '#E63E11',
        };
        return colors[grade || ''] || COLORS.textMuted;
    };

    if (variant === 'compact') {
        return (
            <TouchableOpacity style={styles.compactContainer} onPress={onPress} activeOpacity={0.7}>
                <View style={styles.compactImageWrapper}>
                    {product.imageUrl ? (
                        <Image source={{ uri: product.imageUrl }} style={styles.compactImage} />
                    ) : (
                        <View style={[styles.compactImage, styles.placeholderImage]}>
                            <Ionicons name="cube-outline" size={20} color={COLORS.textMuted} />
                        </View>
                    )}
                </View>
                <View style={styles.compactInfo}>
                    <Text style={styles.compactName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.compactBrand} numberOfLines={1}>{product.brand}</Text>
                </View>
                <View style={[styles.scoreMiniDisk, { backgroundColor: scoreColor }]}>
                    <Text style={styles.scoreMiniText}>{product.healthScore}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            {/* Image Section */}
            <View style={styles.imageSection}>
                <View style={styles.imageWrapper}>
                    {product.imageUrl ? (
                        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="contain" />
                    ) : (
                        <View style={[styles.image, styles.placeholderImage]}>
                            <Ionicons name="cube-outline" size={40} color={COLORS.textMuted} />
                        </View>
                    )}
                </View>
                {/* Health Score Badge */}
                <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
                    <Text style={styles.scoreBadgeText}>{product.healthScore}</Text>
                </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
                <View style={styles.headerRow}>
                    <Text style={styles.brand} numberOfLines={1}>{product.brand || 'No Brand'}</Text>
                    {product.quantity && (
                        <Text style={styles.quantity}>{product.quantity}</Text>
                    )}
                </View>

                <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

                {/* Badges Row */}
                <View style={styles.badgesRow}>
                    {product.nutriScore && (
                        <View style={styles.glassBadge}>
                            <Text style={styles.badgeLabel}>Nutri-Score</Text>
                            <View style={[styles.gradeIndicator, { backgroundColor: getNutriScoreColor(product.nutriScore) }]}>
                                <Text style={styles.gradeText}>{product.nutriScore.toUpperCase()}</Text>
                            </View>
                        </View>
                    )}

                    {product.novaGroup && (
                        <View style={styles.glassBadge}>
                            <Text style={styles.badgeLabel}>NOVA</Text>
                            <View style={[styles.novaIndicator, { backgroundColor: product.novaGroup === 4 ? COLORS.error + '20' : COLORS.success + '20' }]}>
                                <Text style={[styles.novaText, { color: product.novaGroup === 4 ? COLORS.error : COLORS.success }]}>{product.novaGroup}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Footer Warnings */}
                {product.warnings && product.warnings.length > 0 && (
                    <View style={styles.warningsRow}>
                        <Ionicons
                            name="alert-circle"
                            size={14}
                            color={product.warnings[0].severity === 'danger' ? COLORS.error : COLORS.warning}
                        />
                        <Text style={[styles.warningText, { color: product.warnings[0].severity === 'danger' ? COLORS.error : COLORS.warning }]}>
                            {product.warnings.length} alert{product.warnings.length > 1 ? 's' : ''}
                        </Text>
                    </View>
                )}
            </View>

            {/* Navigation Chevron */}
            <View style={styles.chevronContainer}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.bgCard,
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    imageSection: {
        width: 100,
        height: 100,
        marginRight: 16,
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.bgSecondary,
        borderRadius: 16,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '85%',
        height: '85%',
    },
    placeholderImage: {
        backgroundColor: COLORS.bgCardLight,
    },
    scoreBadge: {
        position: 'absolute',
        top: -8,
        left: -8,
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.bgCard,
        ...SHADOWS.sm,
    },
    scoreBadgeText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoSection: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    brand: {
        fontSize: 10,
        color: COLORS.textMuted,
        fontWeight: FONT_WEIGHT.bold,
        textTransform: 'uppercase',
        letterSpacing: 1,
        flex: 1,
    },
    quantity: {
        fontSize: 10,
        color: COLORS.textMuted,
    },
    name: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.bold,
        marginBottom: 10,
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 8,
    },
    glassBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingLeft: 8,
        paddingRight: 4,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    badgeLabel: {
        fontSize: 9,
        color: COLORS.textSecondary,
        marginRight: 6,
        fontWeight: FONT_WEIGHT.medium,
    },
    gradeIndicator: {
        width: 18,
        height: 18,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#fff',
    },
    novaIndicator: {
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    novaText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    warningsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 4,
    },
    warningText: {
        fontSize: 11,
        fontWeight: FONT_WEIGHT.medium,
    },
    chevronContainer: {
        justifyContent: 'center',
        marginLeft: 4,
    },
    // Compact styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: 16,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 12,
    },
    compactImageWrapper: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: COLORS.bgSecondary,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    compactImage: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
    compactInfo: {
        flex: 1,
    },
    compactName: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.bold,
    },
    compactBrand: {
        fontSize: 10,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
    },
    scoreMiniDisk: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreMiniText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default ProductCard;
