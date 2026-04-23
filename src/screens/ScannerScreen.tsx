import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    FlatList,
    StatusBar,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, getScoreColor, GLASS, GRADIENTS, SHADOWS } from '../constants/theme';
import { fetchProductByBarcode } from '../services/openFoodFacts';
import { searchUnpackedFoods, UNPACKED_FOOD_CATEGORIES } from '../services/usdaFoods';
import { Product } from '../types';

const { width, height } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.75;

interface ScannerScreenProps {
    navigation: any;
    onProductScanned?: (product: any) => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
    navigation,
    onProductScanned,
}) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [flashOn, setFlashOn] = useState(false);
    const [showFoodSearch, setShowFoodSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const scanLineAnim = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;
    const contentAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();

        Animated.timing(contentAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        const scanAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 2500,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 2500,
                    useNativeDriver: true,
                }),
            ])
        );
        scanAnimation.start();

        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.03,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseAnimation.start();

        return () => {
            scanAnimation.stop();
            pulseAnimation.stop();
        };
    }, []);

    const handleBarCodeScanned = async ({ type, data }: any) => {
        if (scanned || isLoading) return;

        setScanned(true);
        setIsLoading(true);

        // Success Haptic
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            const product = await fetchProductByBarcode(data);

            if (product) {
                onProductScanned?.(product);
                navigation.navigate('ProductDetail', { product });
            } else {
                Alert.alert(
                    'Product Not Found',
                    'This product is not in our database yet. Our researchers will look into it!',
                    [{ text: 'OK', onPress: () => setScanned(false) }]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch product information. Check your connection.');
            setScanned(false);
        } finally {
            setIsLoading(false);
        }
    };

    const translateY = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SCANNER_SIZE - 4],
    });

    if (hasPermission === null) {
        return (
            <View style={styles.permissionContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={80} color={COLORS.textMuted} />
                <Text style={styles.permissionTitle}>Camera Required</Text>
                <Text style={styles.permissionText}>
                    To analyze products, NutriScan needs access to your camera.
                </Text>
                <TouchableOpacity style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Enable in Settings</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <CameraView
                style={styles.camera}
                facing="back"
                enableTorch={flashOn}
                barcodeScannerSettings={{
                    barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
                <Animated.View style={[styles.overlay, { opacity: contentAnim }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.glassButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Scan Product</Text>
                            <View style={styles.activeIndicator} />
                        </View>

                        <TouchableOpacity
                            style={styles.glassButton}
                            onPress={() => setFlashOn(!flashOn)}
                        >
                            <Ionicons
                                name={flashOn ? "flash" : "flash-off"}
                                size={20}
                                color={flashOn ? COLORS.warning : "#fff"}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Scanner */}
                    <View style={styles.scannerContainer}>
                        <Animated.View style={[styles.scannerFrame, { transform: [{ scale: pulseAnim }] }]}>
                            {/* Reticle Corners */}
                            <View style={[styles.reticle, styles.topLeft]} />
                            <View style={[styles.reticle, styles.topRight]} />
                            <View style={[styles.reticle, styles.bottomLeft]} />
                            <View style={[styles.reticle, styles.bottomRight]} />

                            {/* Laser Line */}
                            <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]}>
                                <LinearGradient
                                    colors={['rgba(16, 185, 129, 0)', 'rgba(16, 185, 129, 0.5)', 'rgba(16, 185, 129, 0)']}
                                    style={styles.laserGradient}
                                />
                            </Animated.View>
                        </Animated.View>

                        <View style={styles.hintContainer}>
                            <Text style={styles.hintText}>Focus on the barcode</Text>
                        </View>
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.footer}>
                        {isLoading ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                                <Text style={styles.loadingText}>Fetching official data...</Text>
                            </View>
                        ) : (
                            <View style={styles.controlsRow}>
                                <TouchableOpacity
                                    style={styles.actionCard}
                                    onPress={() => setShowFoodSearch(true)}
                                >
                                    <View style={styles.actionIconContainer}>
                                        <Ionicons name="search" size={24} color={COLORS.primary} />
                                    </View>
                                    <Text style={styles.actionText}>Search Food</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionCard}
                                    onPress={() => { }} // Manual Entry
                                >
                                    <View style={styles.actionIconContainer}>
                                        <Ionicons name="keypad" size={24} color={COLORS.textSecondary} />
                                    </View>
                                    <Text style={styles.actionText}>Enter Code</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </CameraView>

            {/* Premium Search Modal */}
            <Modal
                visible={showFoodSearch}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFoodSearch(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.dragHandle} />
                            <View style={styles.modalTopRow}>
                                <Text style={styles.modalTitle}>Search Unpacked</Text>
                                <TouchableOpacity onPress={() => setShowFoodSearch(false)}>
                                    <Text style={styles.doneText}>Done</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.searchBar}>
                                <Ionicons name="search" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Rice, Quinoa, Spinach..."
                                    placeholderTextColor={COLORS.textMuted}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={async () => {
                                        if (searchQuery.trim()) {
                                            setIsSearching(true);
                                            const results = await searchUnpackedFoods(searchQuery);
                                            setSearchResults(results);
                                            setIsSearching(false);
                                        }
                                    }}
                                    autoFocus
                                />
                            </View>
                        </View>

                        <View style={styles.modalBody}>
                            {isSearching ? (
                                <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
                            ) : searchResults.length > 0 ? (
                                <FlatList
                                    data={searchResults}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={{ padding: SPACING.lg }}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.resultCard}
                                            onPress={() => {
                                                setShowFoodSearch(false);
                                                navigation.navigate('ProductDetail', { product: item });
                                            }}
                                        >
                                            <View style={styles.resultMain}>
                                                <Text style={styles.resultName}>{item.name}</Text>
                                                <Text style={styles.resultSub}>{item.brand}</Text>
                                            </View>
                                            <View style={[styles.resultScore, { backgroundColor: getScoreColor(item.healthScore) }]}>
                                                <Text style={styles.resultScoreText}>{item.healthScore}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="leaf-outline" size={60} color={COLORS.bgCardLight} />
                                    <Text style={styles.emptyText}>Find health scores for fruits, grains, and loose items.</Text>
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
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: SPACING.lg,
    },
    glassButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
        letterSpacing: 0.5,
    },
    activeIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.excellent,
    },
    scannerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerFrame: {
        width: SCANNER_SIZE,
        height: SCANNER_SIZE,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
    },
    reticle: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: COLORS.primary,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: BORDER_RADIUS.xl,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: BORDER_RADIUS.xl,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: BORDER_RADIUS.xl,
    },
    scanLine: {
        position: 'absolute',
        width: '100%',
        height: 40,
        zIndex: 10,
    },
    laserGradient: {
        height: '100%',
        width: '100%',
    },
    hintContainer: {
        marginTop: SPACING.xl,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
    },
    hintText: {
        color: '#fff',
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.medium,
    },
    footer: {
        paddingBottom: 60,
        paddingHorizontal: SPACING.xl,
    },
    loadingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        gap: 12,
    },
    loadingText: {
        color: '#fff',
        fontSize: FONT_SIZE.md,
    },
    controlsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    actionCard: {
        flex: 1,
        backgroundColor: GLASS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: GLASS.border,
    },
    actionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        color: '#fff',
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.semibold,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.bgPrimary,
        height: height * 0.85,
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
        overflow: 'hidden',
    },
    modalHeader: {
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: COLORS.bgCardLight,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: SPACING.md,
    },
    modalTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },
    doneText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: FONT_SIZE.md,
    },
    modalBody: {
        flex: 1,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    resultMain: {
        flex: 1,
    },
    resultName: {
        color: '#fff',
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
    },
    resultSub: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.sm,
        marginTop: 2,
    },
    resultScore: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultScoreText: {
        color: '#000',
        fontWeight: FONT_WEIGHT.extrabold,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxxl,
    },
    emptyText: {
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: SPACING.lg,
        fontSize: FONT_SIZE.md,
        lineHeight: 24,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxxl,
    },
    permissionTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
        marginTop: 24,
    },
    permissionText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 32,
        fontSize: FONT_SIZE.md,
    },
    permissionButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.full,
    },
    permissionButtonText: {
        color: '#fff',
        fontWeight: FONT_WEIGHT.bold,
    },
});

export default ScannerScreen;


