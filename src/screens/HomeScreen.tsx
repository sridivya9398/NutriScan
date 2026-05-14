import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, GLASS, GRADIENTS, SHADOWS } from '../constants/theme';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
    navigation: any;
    recentScans?: Product[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, recentScans = [] }) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;
    const scrollY = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.92,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handleScan = () => {
        navigation.navigate('Scanner');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Decorative Element */}
            <View style={styles.bgDecor} />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerSubtitle}>Good Morning</Text>
                        <Text style={styles.headerTitle}>NutriScan</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <LinearGradient
                            colors={GRADIENTS.premium as any}
                            style={styles.profileGradient}
                        >
                            <Ionicons name="person" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <Animated.ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                >
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
                            style={styles.heroGlass}
                        >
                            <Text style={styles.heroTagline}>
                                Unlock the secrets of your food. Every scan leads to a healthier you.
                            </Text>

                            <View style={styles.scanWrapper}>
                                <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={handleScan}
                                    onPressIn={onPressIn}
                                    onPressOut={onPressOut}
                                >
                                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                        <LinearGradient
                                            colors={GRADIENTS.premium as any}
                                            style={styles.scanButton}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <Ionicons name="scan" size={48} color="#fff" />
                                            <Text style={styles.scanButtonText}>Scan Now</Text>
                                        </LinearGradient>
                                    </Animated.View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.statsBar}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{recentScans.length}</Text>
                                    <Text style={styles.statLabel}>Scans</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>
                                        {recentScans.filter(p => p.healthScore >= 75).length}
                                    </Text>
                                    <Text style={styles.statLabel}>Healthy</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>4M+</Text>
                                    <Text style={styles.statLabel}>Base</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Quick Analysis Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>OUR ANALYSIS</Text>
                            <View style={styles.titleDivider} />
                        </View>
                        <View style={styles.featuresGrid}>
                            {[
                                { icon: 'fitness', title: 'Health Score', color: COLORS.excellent },
                                { icon: 'flask', title: 'Additives', color: COLORS.warning },
                                { icon: 'nutrition', title: 'Nutrients', color: COLORS.info },
                                { icon: 'medical', title: 'Allergens', color: COLORS.error },
                            ].map((item, idx) => (
                                <View key={idx} style={styles.featureCard}>
                                    <View style={[styles.featureIcon, { backgroundColor: item.color + '20' }]}>
                                        <Ionicons name={item.icon as any} size={22} color={item.color} />
                                    </View>
                                    <Text style={styles.featureTitle}>{item.title}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Daily NutriTip */}
                    <View style={styles.section}>
                        <LinearGradient
                            colors={GRADIENTS.premium as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.tipCard}
                        >
                            <View style={styles.tipHeader}>
                                <Ionicons name="bulb" size={24} color="#fff" />
                                <Text style={styles.tipTitle}>NUTRITIP OF THE DAY</Text>
                            </View>
                            <Text style={styles.tipText}>
                                "Did you know? Eating a handful of walnuts a day can help improve your heart health and provide essential Omega-3 fatty acids."
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Recent Activities */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>RECENT ACTIVITIES</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('History')}>
                                <Text style={styles.seeAll}>History</Text>
                            </TouchableOpacity>
                        </View>

                        {recentScans.length > 0 ? (
                            recentScans.slice(0, 3).map((product, index) => (
                                <ProductCard
                                    key={product.id || index}
                                    product={product}
                                    onPress={() => navigation.navigate('ProductDetail', { product })}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyCard}>
                                <View style={styles.emptyIconCircle}>
                                    <Ionicons name="barcode-outline" size={32} color={COLORS.textMuted} />
                                </View>
                                <Text style={styles.emptyTitle}>No Scans Yet</Text>
                                <Text style={styles.emptyDesc}>Start scanning to build your history</Text>
                            </View>
                        )}
                    </View>
                </Animated.ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    bgDecor: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: COLORS.primary + '15',
        transform: [{ scale: 1.5 }],
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
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: FONT_WEIGHT.bold,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        marginTop: 2,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: COLORS.bgCard,
        ...SHADOWS.sm,
    },
    profileGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroSection: {
        paddingHorizontal: SPACING.lg,
        marginBottom: 32,
    },
    heroGlass: {
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    heroTagline: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        fontWeight: FONT_WEIGHT.medium,
    },
    scanWrapper: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    pulseRing: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: COLORS.primary + '15',
    },
    scanButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.lg,
    },
    scanButtonText: {
        fontSize: 16,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
        marginTop: 8,
    },
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
        width: '100%',
        paddingVertical: 16,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    section: {
        marginBottom: 32,
        paddingHorizontal: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textMuted,
        letterSpacing: 2,
    },
    titleDivider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    seeAll: {
        fontSize: 13,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.primary,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureCard: {
        width: (width - SPACING.lg * 2 - 12) / 2,
        backgroundColor: COLORS.bgCard,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureTitle: {
        fontSize: 13,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        flex: 1,
    },
    emptyCard: {
        backgroundColor: COLORS.bgCard,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.bgSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    emptyDesc: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
        textAlign: 'center',
    },
    tipCard: {
        borderRadius: 24,
        padding: 20,
        ...SHADOWS.md,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    tipTitle: {
        fontSize: 12,
        fontWeight: FONT_WEIGHT.bold,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 1.5,
    },
    tipText: {
        fontSize: 15,
        color: '#fff',
        lineHeight: 22,
        fontWeight: FONT_WEIGHT.medium,
        fontStyle: 'italic',
    },
});

export default HomeScreen;
