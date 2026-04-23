import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Share,
    Dimensions,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Product } from '../types';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, getScoreColor, getScoreLabel, SHADOWS, GLASS, GRADIENTS } from '../constants/theme';
import { HealthScoreCircle } from '../components/HealthScoreCircle';
import { NutritionCard } from '../components/NutritionCard';
import { WarningsList } from '../components/WarningsList';

const { width } = Dimensions.get('window');

interface ProductDetailScreenProps {
    route: { params: { product: Product } };
    navigation: any;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
    route,
    navigation
}) => {
    const { product } = route.params;
    const [isFavorite, setIsFavorite] = React.useState(false);
    const scoreColor = getScoreColor(product.healthScore);

    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const toggleFavorite = () => {
        triggerHaptic();
        setIsFavorite(!isFavorite);
    };

    const handleShare = async () => {
        triggerHaptic();
        try {
            await Share.share({
                message: `I scanned ${product.name} with NutriScan! Health Score: ${product.healthScore}/100 (${getScoreLabel(product.healthScore)})`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const getNutriScoreColor = (grade?: string) => {
        const colors: Record<string, string> = {
            a: '#038141',
            b: '#85BB2F',
            c: '#FECB02',
            d: '#EE8100',
            e: '#E63E11',
        };
        return colors[grade || ''.toLowerCase()] || COLORS.textMuted;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Dynamic Background Glow */}
            <View style={[styles.bgGlow, { backgroundColor: scoreColor }]} />

            <LinearGradient
                colors={['transparent', COLORS.bgPrimary]}
                style={styles.headerOverlay}
            />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Custom Navigation */}
                <View style={styles.navHeader}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.navActions}>
                        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                            <Ionicons name="share-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
                            <Ionicons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={24}
                                color={isFavorite ? COLORS.error : "#fff"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={styles.imageContainer}>
                            {product.imageUrl ? (
                                <Image
                                    source={{ uri: product.imageUrl }}
                                    style={styles.productImage}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Ionicons name="cube-outline" size={80} color={COLORS.textMuted} />
                                </View>
                            )}
                            <View style={styles.imageShadow} />
                        </View>

                        <View style={styles.productInfo}>
                            <Text style={styles.brand}>{product.brand || 'Unknown Brand'}</Text>
                            <Text style={styles.name}>{product.name}</Text>
                            <Text style={styles.quantity}>{product.quantity || 'Standard Size'}</Text>
                        </View>

                        <View style={styles.scoreHighlight}>
                            <HealthScoreCircle
                                score={product.healthScore}
                                size="large"
                                showLabel={true}
                                showGrade={true}
                            />
                        </View>
                    </View>

                    {/* Summary Badges Grid */}
                    <View style={styles.badgeGrid}>
                        {product.nutriScore && (
                            <TouchableOpacity style={styles.glassBadge}>
                                <Text style={styles.badgeLabel}>Nutri-Score</Text>
                                <View style={[styles.gradeIndicator, { backgroundColor: getNutriScoreColor(product.nutriScore) }]}>
                                    <Text style={styles.gradeLetter}>{product.nutriScore.toUpperCase()}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        {product.novaGroup && (
                            <TouchableOpacity style={styles.glassBadge}>
                                <Text style={styles.badgeLabel}>NOVA Group</Text>
                                <View style={styles.novaIndicator}>
                                    <Text style={styles.novaValue}>{product.novaGroup}</Text>
                                    <Text style={styles.novaText}>
                                        {product.novaGroup === 4 ? 'Ultra-processed' : 'Processed'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Content Cards */}
                    <View style={styles.cardsContainer}>
                        {/* Highlights (Positives) */}
                        {product.positives && product.positives.length > 0 && (
                            <View style={styles.premiumCard}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.headerIcon, { backgroundColor: COLORS.excellent + '20' }]}>
                                        <Ionicons name="sparkles" size={20} color={COLORS.excellent} />
                                    </View>
                                    <Text style={styles.cardTitle}>Why it's good</Text>
                                </View>
                                <View style={styles.positivesList}>
                                    {product.positives.map((item, index) => (
                                        <View key={index} style={styles.positiveItem}>
                                            <Ionicons name="checkmark-circle" size={18} color={COLORS.excellent} />
                                            <Text style={styles.positiveText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Analysis Section */}
                        <WarningsList
                            warnings={product.warnings || []}
                            additives={product.additives}
                            allergens={product.allergens}
                            userAllergens={[]}
                        />

                        {/* Nutrition Detailed Card */}
                        <NutritionCard nutrition={product.nutrition} expanded={false} />

                        {/* Ingredients List */}
                        {product.ingredients && (
                            <View style={styles.premiumCard}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.headerIcon, { backgroundColor: COLORS.info + '20' }]}>
                                        <Ionicons name="list" size={20} color={COLORS.info} />
                                    </View>
                                    <Text style={styles.cardTitle}>Ingredients</Text>
                                </View>
                                <Text style={styles.ingredientsText}>{product.ingredients}</Text>
                            </View>
                        )}
                    </View>

                    {/* CTA Section */}
                    <TouchableOpacity
                        style={styles.ctaButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('AlternativesList', { product })}
                    >
                        <LinearGradient
                            colors={GRADIENTS.premium as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaGradient}
                        >
                            <Ionicons name="swap-horizontal" size={24} color="#fff" />
                            <Text style={styles.ctaText}>Explore Healthier Alternatives</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.sourceText}>Official Data from Open Food Facts</Text>
                        <Text style={styles.updateText}>Last synced today • High confidence</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    bgGlow: {
        position: 'absolute',
        top: -150,
        alignSelf: 'center',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: (width * 1.5) / 2,
        opacity: 0.15,
        transform: [{ scaleX: 1.2 }],
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 500,
    },
    safeArea: {
        flex: 1,
    },
    navHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        zIndex: 10,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    navActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SPACING.xxxl,
    },
    heroSection: {
        alignItems: 'center',
        paddingTop: SPACING.lg,
        paddingHorizontal: SPACING.xl,
    },
    imageContainer: {
        width: width * 0.6,
        height: width * 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    productImage: {
        width: '100%',
        height: '100%',
        zIndex: 2,
    },
    placeholderImage: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageShadow: {
        position: 'absolute',
        bottom: 10,
        width: width * 0.4,
        height: 20,
        backgroundColor: '#000',
        borderRadius: 100,
        opacity: 0.4,
        transform: [{ scaleX: 1.5 }],
        zIndex: 1,
    },
    productInfo: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    brand: {
        fontSize: FONT_SIZE.md,
        color: COLORS.primary,
        fontWeight: FONT_WEIGHT.bold,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    name: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        textAlign: 'center',
        lineHeight: 38,
    },
    quantity: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.textSecondary,
        marginTop: 8,
    },
    scoreHighlight: {
        marginBottom: SPACING.xxl,
        ...SHADOWS.lg,
    },
    badgeGrid: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.md,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    glassBadge: {
        flex: 1,
        backgroundColor: GLASS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: GLASS.border,
        alignItems: 'center',
    },
    badgeLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        fontWeight: FONT_WEIGHT.bold,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    gradeIndicator: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradeLetter: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.extrabold,
        color: '#fff',
    },
    novaIndicator: {
        alignItems: 'center',
    },
    novaValue: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    novaText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    cardsContainer: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    premiumCard: {
        backgroundColor: COLORS.bgCard,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    positivesList: {
        gap: SPACING.md,
    },
    positiveItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    positiveText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.medium,
        flex: 1,
    },
    ingredientsText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    ctaButton: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
        ...SHADOWS.md,
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.md,
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
    },
    ctaText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.xxl,
        paddingBottom: SPACING.xl,
    },
    sourceText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.semibold,
    },
    updateText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        marginTop: 4,
    },
});

export default ProductDetailScreen;

