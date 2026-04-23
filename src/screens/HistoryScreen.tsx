import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, getScoreColor, GLASS, GRADIENTS, SHADOWS } from '../constants/theme';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

const { width } = Dimensions.get('window');

const DEMO_HISTORY: Product[] = [
    {
        id: '1',
        barcode: '3017620422003',
        name: 'Nutella Hazelnut Spread',
        brand: 'Ferrero',
        healthScore: 28,
        nutriScore: 'e',
        novaGroup: 4,
        imageUrl: 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.614.400.jpg',
        nutrition: { calories: 539, sugars: 56.3, fat: 30.9, protein: 6.3 },
        warnings: [{ type: 'nutrition', severity: 'danger', title: 'High Sugar', description: '56.3g per 100g' }],
    },
    {
        id: '2',
        barcode: '3175681851849',
        name: 'Organic Rolled Oats',
        brand: 'Bjorg',
        healthScore: 92,
        nutriScore: 'a',
        novaGroup: 1,
        imageUrl: 'https://images.openfoodfacts.org/images/products/317/568/185/1849/front_fr.208.400.jpg',
        nutrition: { calories: 367, fiber: 10.6, protein: 13.5 },
        positives: ['High in fiber', 'Unprocessed'],
    },
    {
        id: '3',
        barcode: '5449000000996',
        name: 'Coca-Cola Classic',
        brand: 'Coca-Cola',
        healthScore: 15,
        nutriScore: 'e',
        novaGroup: 4,
        imageUrl: 'https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.614.400.jpg',
        nutrition: { calories: 42, sugars: 10.6 },
        warnings: [{ type: 'nutrition', severity: 'danger', title: 'High Sugar', description: '10.6g per 100ml' }],
    },
] as Product[];

export const HistoryScreen: React.FC<{ navigation: any, scanHistory?: Product[] }> = ({
    navigation,
    scanHistory = DEMO_HISTORY,
}) => {
    const [favorites, setFavorites] = React.useState<string[]>(['2']);

    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleClearHistory = () => {
        triggerHaptic();
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete all scans? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Clear All", style: "destructive", onPress: () => triggerHaptic() }
            ]
        );
    };

    const groupedHistory = React.useMemo(() => {
        const today: Product[] = [];
        const yesterday: Product[] = [];
        const thisWeek: Product[] = [];

        scanHistory.forEach((item, index) => {
            if (index === 0) today.push(item);
            else if (index === 1) yesterday.push(item);
            else thisWeek.push(item);
        });

        return { today, yesterday, thisWeek };
    }, [scanHistory]);

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.headerSubtitle}>Your Scans</Text>
                <Text style={styles.headerTitle}>History</Text>
            </View>
            <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconButton} onPress={() => triggerHaptic()}>
                    <Ionicons name="search" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleClearHistory}>
                    <Ionicons name="trash-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSection = (title: string, items: Product[]) => {
        if (items.length === 0) return null;
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <View style={styles.titleDivider} />
                </View>
                {items.map(item => (
                    <ProductCard
                        key={item.id}
                        product={item}
                        onPress={() => navigation.navigate('ProductDetail', { product: item })}
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {renderHeader()}

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Favorites Horizontal Scroll */}
                    {favorites.length > 0 && (
                        <View style={styles.favoritesSection}>
                            <View style={styles.favoritesHeader}>
                                <Ionicons name="heart" size={18} color={COLORS.error} />
                                <Text style={styles.favoritesTitle}>FAVORITES</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoritesList}>
                                {scanHistory.filter(p => favorites.includes(p.id)).map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.favoriteCard}
                                        onPress={() => navigation.navigate('ProductDetail', { product: item })}
                                    >
                                        <LinearGradient
                                            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                                            style={styles.favoriteGradient}
                                        >
                                            <View style={styles.favoriteScore}>
                                                <View style={[styles.scoreDot, { backgroundColor: getScoreColor(item.healthScore) }]} />
                                                <Text style={styles.favoriteScoreText}>{item.healthScore}</Text>
                                            </View>
                                            <Text style={styles.favoriteName} numberOfLines={1}>{item.name}</Text>
                                            <Text style={styles.favoriteBrand} numberOfLines={1}>{item.brand}</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Groups */}
                    {renderSection('Today', groupedHistory.today)}
                    {renderSection('Yesterday', groupedHistory.yesterday)}
                    {renderSection('This Week', groupedHistory.thisWeek)}

                    {scanHistory.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="time" size={40} color={COLORS.bgCardLight} />
                            </View>
                            <Text style={styles.emptyTitle}>No Scans Yet</Text>
                            <Text style={styles.emptyText}>Products you scan will appear here for easy access.</Text>
                            <TouchableOpacity
                                style={styles.emptyCTA}
                                onPress={() => navigation.navigate('Scanner')}
                            >
                                <LinearGradient
                                    colors={GRADIENTS.premium as any}
                                    style={styles.ctaGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.ctaText}>Start Scanning</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
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
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg,
    },
    headerSubtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
        fontWeight: FONT_WEIGHT.medium,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    favoritesSection: {
        marginBottom: SPACING.xl,
    },
    favoritesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: 12,
        gap: 8,
    },
    favoritesTitle: {
        fontSize: 12,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textMuted,
        letterSpacing: 1,
    },
    favoritesList: {
        paddingHorizontal: SPACING.lg,
        gap: 12,
    },
    favoriteCard: {
        width: 140,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    favoriteGradient: {
        padding: 16,
    },
    favoriteScore: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    scoreDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    favoriteScoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    favoriteName: {
        fontSize: 13,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
    },
    favoriteBrand: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    section: {
        paddingHorizontal: SPACING.lg,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textSecondary,
    },
    titleDivider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    emptyCTA: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    ctaGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    ctaText: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
    },
});

export default HistoryScreen;
