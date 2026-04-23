import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    ActivityIndicator,
    Modal,
    FlatList,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, getScoreColor, GLASS, GRADIENTS, SHADOWS } from '../constants/theme';
import { Product } from '../types';
import { searchProductsByCategory } from '../services/openFoodFacts';

const { width, height } = Dimensions.get('window');

const FOOD_CATEGORIES = [
    { id: 'breakfast', label: 'Breakfast', icon: '🥣', color: '#FFB347' },
    { id: 'snacks', label: 'Snacks', icon: '🍿', color: '#87CEEB' },
    { id: 'beverages', label: 'Beverages', icon: '🥤', color: '#98FB98' },
    { id: 'dairy', label: 'Dairy', icon: '🧀', color: '#DDA0DD' },
    { id: 'bakery', label: 'Bakery', icon: '🥖', color: '#F4A460' },
    { id: 'frozen', label: 'Frozen', icon: '🧊', color: '#ADD8E6' },
    { id: 'organic', label: 'Organic', icon: '🌿', color: '#90EE90' },
    { id: 'baby', label: 'Baby Food', icon: '🍼', color: '#FFB6C1' },
];

const COSMETICS_CATEGORIES = [
    { id: 'skincare', label: 'Skincare', icon: '🧴', color: '#E6E6FA' },
    { id: 'haircare', label: 'Hair Care', icon: '💇', color: '#FFD700' },
    { id: 'makeup', label: 'Makeup', icon: '💄', color: '#FF69B4' },
    { id: 'bodycare', label: 'Body Care', icon: '🛁', color: '#87CEFA' },
    { id: 'suncare', label: 'Sun Care', icon: '☀️', color: '#FFA500' },
    { id: 'deodorant', label: 'Deodorant', icon: '🧼', color: '#98D8C8' },
    { id: 'toothpaste', label: 'Oral Care', icon: '🦷', color: '#FFFFFF' },
    { id: 'baby-care', label: 'Baby Care', icon: '👶', color: '#FFB6C1' },
];

const POPULAR_PRODUCTS: Product[] = [
    {
        id: 'pop1',
        barcode: '123',
        name: 'Greek Yogurt',
        brand: 'Chobani',
        healthScore: 85,
        nutriScore: 'a',
        imageUrl: 'https://images.openfoodfacts.org/images/products/001/800/010/3103/front_en.7.400.jpg',
        nutrition: { calories: 100, protein: 17 },
    },
    {
        id: 'pop2',
        barcode: '124',
        name: 'Hummus',
        brand: 'Sabra',
        healthScore: 72,
        nutriScore: 'b',
        imageUrl: 'https://images.openfoodfacts.org/images/products/030/034/500/0200/front_en.23.400.jpg',
        nutrition: { calories: 166, protein: 7.9 },
    },
    {
        id: 'pop3',
        barcode: '125',
        name: 'Almond Milk',
        brand: 'Califia',
        healthScore: 78,
        nutriScore: 'a',
        nutrition: { calories: 30, protein: 1 },
    },
] as Product[];

export const DiscoverScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeTab, setActiveTab] = React.useState<'food' | 'cosmetics'>('food');
    const [categoryProducts, setCategoryProducts] = React.useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState<{ label: string, icon: string } | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showCategoryModal, setShowCategoryModal] = React.useState(false);

    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleTabChange = (tab: 'food' | 'cosmetics') => {
        triggerHaptic();
        setActiveTab(tab);
    };

    const categories = activeTab === 'food' ? FOOD_CATEGORIES : COSMETICS_CATEGORIES;

    const handleCategoryPress = async (categoryId: string, categoryLabel: string, emoji: string) => {
        triggerHaptic();
        setSelectedCategory({ label: categoryLabel, icon: emoji });
        setIsLoading(true);
        setShowCategoryModal(true);

        try {
            const products = await searchProductsByCategory(categoryId);
            setCategoryProducts(products);
        } catch (error) {
            setCategoryProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderCategoryProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.premiumListCard}
            onPress={() => {
                setShowCategoryModal(false);
                navigation.navigate('ProductDetail', { product: item });
            }}
        >
            <View style={styles.listCardImageContainer}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.listCardImage} />
                ) : (
                    <Ionicons name="cube-outline" size={24} color={COLORS.textMuted} />
                )}
            </View>
            <View style={styles.listCardContent}>
                <Text style={styles.listCardBrand}>{item.brand}</Text>
                <Text style={styles.listCardName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.listCardFooter}>
                    <View style={[styles.scoreMini, { backgroundColor: getScoreColor(item.healthScore) }]}>
                        <Text style={styles.scoreMiniText}>{item.healthScore}</Text>
                    </View>
                    {item.nutriScore && (
                        <View style={styles.nutriBadgeMini}>
                            <Text style={styles.nutriBadgeText}>{item.nutriScore.toUpperCase()}</Text>
                        </View>
                    )}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>Good Morning</Text>
                            <Text style={styles.title}>Discover</Text>
                        </View>
                        <TouchableOpacity style={styles.profileButton}>
                            <Ionicons name="person-circle-outline" size={32} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Premium Search */}
                    <View style={styles.searchSection}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color={COLORS.textMuted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search foods or cosmetics..."
                                placeholderTextColor={COLORS.textMuted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Segmented Switch */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'food' && styles.tabActive]}
                            onPress={() => handleTabChange('food')}
                        >
                            <Text style={[styles.tabText, activeTab === 'food' && styles.tabTextActive]}>Food</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'cosmetics' && styles.tabActive]}
                            onPress={() => handleTabChange('cosmetics')}
                        >
                            <Text style={[styles.tabText, activeTab === 'cosmetics' && styles.tabTextActive]}>Cosmetics</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Categories Grid */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <View style={styles.grid}>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={styles.categoryCard}
                                    onPress={() => handleCategoryPress(cat.id, cat.label, cat.icon)}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: cat.color + '15' }]}>
                                        <Text style={styles.emoji}>{cat.icon}</Text>
                                    </View>
                                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Trending Scroll */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Trending</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingContainer}>
                            {POPULAR_PRODUCTS.map(product => (
                                <TouchableOpacity
                                    key={product.id}
                                    style={styles.productCard}
                                    onPress={() => navigation.navigate('ProductDetail', { product })}
                                >
                                    <View style={styles.productImageContainer}>
                                        {product.imageUrl ? (
                                            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                                        ) : (
                                            <Ionicons name="cube-outline" size={32} color={COLORS.textMuted} />
                                        )}
                                        <View style={[styles.scoreOverlay, { backgroundColor: getScoreColor(product.healthScore) }]}>
                                            <Text style={styles.scoreText}>{product.healthScore}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                                    <View style={styles.productMeta}>
                                        <Text style={styles.productBrand}>{product.brand}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Premium Pro Tip Card */}
                    <TouchableOpacity style={styles.tipCard} activeOpacity={0.9}>
                        <LinearGradient
                            colors={GRADIENTS.premium as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.tipGradient}
                        >
                            <View style={styles.tipTextContent}>
                                <Text style={styles.tipTitle}>Pro Tip: Check NOVA</Text>
                                <Text style={styles.tipDesc}>Avoid NOVA Group 4 products which are ultra-processed.</Text>
                            </View>
                            <View style={styles.tipIconBox}>
                                <Ionicons name="sparkles" size={24} color="#fff" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            {/* Premium Category Modal */}
            <Modal
                visible={showCategoryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.dragHandle} />
                            <View style={styles.modalTopRow}>
                                <View style={styles.modalTitleBox}>
                                    <Text style={styles.modalEmoji}>{selectedCategory?.icon}</Text>
                                    <Text style={styles.modalTitle}>{selectedCategory?.label}</Text>
                                </View>
                                <TouchableOpacity style={styles.closeIcon} onPress={() => setShowCategoryModal(false)}>
                                    <Ionicons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.modalBody}>
                            {isLoading ? (
                                <View style={styles.modalLoading}>
                                    <ActivityIndicator color={COLORS.primary} size="large" />
                                    <Text style={styles.loadingText}>Fetching best options...</Text>
                                </View>
                            ) : categoryProducts.length > 0 ? (
                                <FlatList
                                    data={categoryProducts}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderCategoryProduct}
                                    contentContainerStyle={styles.listContent}
                                    showsVerticalScrollIndicator={false}
                                />
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="search-outline" size={60} color={COLORS.bgCardLight} />
                                    <Text style={styles.emptyText}>Nothing found in this section yet.</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    greeting: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textMuted,
        fontWeight: FONT_WEIGHT.medium,
    },
    title: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        marginTop: 2,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchSection: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: FONT_SIZE.md,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: SPACING.lg,
        backgroundColor: COLORS.bgCard,
        borderRadius: 12,
        padding: 4,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: COLORS.bgSecondary,
        ...SHADOWS.sm,
    },
    tabText: {
        color: COLORS.textMuted,
        fontWeight: FONT_WEIGHT.semibold,
        fontSize: FONT_SIZE.md,
    },
    tabTextActive: {
        color: COLORS.primary,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: SPACING.lg,
    },
    seeAll: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    categoryCard: {
        width: (width - SPACING.lg * 2 - SPACING.md * 3) / 4,
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    emoji: {
        fontSize: 32,
    },
    categoryLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.medium,
        textAlign: 'center',
    },
    trendingContainer: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    productCard: {
        width: 160,
        backgroundColor: COLORS.bgCard,
        borderRadius: 20,
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    productImageContainer: {
        width: '100%',
        height: 120,
        backgroundColor: COLORS.bgSecondary,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    productImage: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
    scoreOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },
    productName: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    productMeta: {
        marginTop: 4,
    },
    productBrand: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
    },
    tipCard: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        borderRadius: 24,
        overflow: 'hidden',
    },
    tipGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        justifyContent: 'space-between',
    },
    tipTextContent: {
        flex: 1,
        marginRight: 20,
    },
    tipTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
    },
    tipDesc: {
        fontSize: FONT_SIZE.sm,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        lineHeight: 20,
    },
    tipIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.bgPrimary,
        height: height * 0.85,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    modalHeader: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.bgCardLight,
        borderRadius: 2,
        marginBottom: SPACING.lg,
    },
    modalTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    modalTitleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalEmoji: {
        fontSize: 24,
    },
    modalTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
    },
    closeIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBody: {
        flex: 1,
    },
    modalLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.textMuted,
        marginTop: 16,
        fontSize: FONT_SIZE.md,
    },
    listContent: {
        padding: SPACING.lg,
    },
    premiumListCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        padding: SPACING.md,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    listCardImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: COLORS.bgSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listCardImage: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
    listCardContent: {
        flex: 1,
        marginLeft: 16,
    },
    listCardBrand: {
        fontSize: 10,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
    },
    listCardName: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
    },
    listCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 8,
    },
    scoreMini: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    scoreMiniText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    nutriBadgeMini: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    nutriBadgeText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 20,
        fontSize: FONT_SIZE.md,
        lineHeight: 24,
    },
});
export default DiscoverScreen;
