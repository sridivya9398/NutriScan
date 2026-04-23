import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    StatusBar,
    Dimensions,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, GLASS, GRADIENTS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Allergen list
const ALLERGENS = [
    { id: 'gluten', label: 'Gluten', icon: '🌾' },
    { id: 'milk', label: 'Milk/Dairy', icon: '🥛' },
    { id: 'eggs', label: 'Eggs', icon: '🥚' },
    { id: 'nuts', label: 'Tree Nuts', icon: '🥜' },
    { id: 'peanuts', label: 'Peanuts', icon: '🥜' },
    { id: 'soy', label: 'Soy', icon: '🫘' },
    { id: 'fish', label: 'Fish', icon: '🐟' },
    { id: 'shellfish', label: 'Shellfish', icon: '🦐' },
    { id: 'sesame', label: 'Sesame', icon: '🌿' },
    { id: 'celery', label: 'Celery', icon: '🥬' },
    { id: 'mustard', label: 'Mustard', icon: '🟡' },
    { id: 'sulphites', label: 'Sulphites', icon: '⚗️' },
    { id: 'lupin', label: 'Lupin', icon: '🌸' },
    { id: 'molluscs', label: 'Molluscs', icon: '🐚' },
];

// Dietary preferences
const DIETARY_PREFERENCES = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'gluten-free', label: 'Gluten-Free', icon: '🚫🌾' },
    { id: 'lactose-free', label: 'Lactose-Free', icon: '🚫🥛' },
    { id: 'keto', label: 'Keto', icon: '🥑' },
    { id: 'paleo', label: 'Paleo', icon: '🍖' },
    { id: 'low-sodium', label: 'Low Sodium', icon: '🧂' },
    { id: 'low-sugar', label: 'Low Sugar', icon: '🚫🍬' },
    { id: 'halal', label: 'Halal', icon: '☪️' },
    { id: 'kosher', label: 'Kosher', icon: '✡️' },
];

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [selectedAllergens, setSelectedAllergens] = React.useState<string[]>(['milk', 'nuts']);
    const [selectedDiets, setSelectedDiets] = React.useState<string[]>(['vegetarian']);
    const [notifications, setNotifications] = React.useState(true);
    const [scanSound, setScanSound] = React.useState(true);
    const [hapticFeedback, setHapticFeedback] = React.useState(true);
    const [userName, setUserName] = React.useState('Guest User');
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [showAuthModal, setShowAuthModal] = React.useState(false);
    const [showContentModal, setShowContentModal] = React.useState(false);
    const [contentTitle, setContentTitle] = React.useState('');
    const [contentBody, setContentBody] = React.useState('');
    const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isAuthenticating, setIsAuthenticating] = React.useState(false);

    const triggerHaptic = () => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const toggleAllergen = (id: string) => {
        triggerHaptic();
        setSelectedAllergens(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const toggleDiet = (id: string) => {
        triggerHaptic();
        setSelectedDiets(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const handleFeatureAlert = (title: string) => {
        triggerHaptic();
        Alert.alert(
            title,
            "This feature is coming in a future update. Stay tuned!",
            [{ text: "Awesome", style: "default" }]
        );
    };

    const handleEditName = () => {
        triggerHaptic();
        Alert.prompt(
            "Change Name",
            "Enter your name",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Save",
                    onPress: (name: string | undefined) => name && setUserName(name)
                }
            ],
            "plain-text",
            userName
        );
    };

    const handleSignIn = () => {
        triggerHaptic();
        if (isLoggedIn) {
            Alert.alert(
                "Sign Out",
                "Are you sure you want to sign out?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Sign Out",
                        style: "destructive",
                        onPress: () => {
                            triggerHaptic();
                            setIsLoggedIn(false);
                            setUserName('Guest User');
                        }
                    }
                ]
            );
        } else {
            setAuthMode('login');
            setShowAuthModal(true);
        }
    };

    const handleAuthAction = () => {
        triggerHaptic();
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setIsAuthenticating(true);
        // Mock authentication delay
        setTimeout(() => {
            setIsAuthenticating(false);
            setIsLoggedIn(true);
            setUserName(email.split('@')[0] || 'User');
            setShowAuthModal(false);
            setEmail('');
            setPassword('');
            Alert.alert("Success", authMode === 'login' ? "Logged in successfully!" : "Account created successfully!");
        }, 1500);
    };

    const showContent = (title: string) => {
        triggerHaptic();
        const bodyMap: Record<string, string> = {
            'Help & Support': "NutriScan FAQ\n\n1. How do I scan?\nTap the scan button in the tab bar.\n\n2. What is Nutri-Score?\nIt is a nutritional rating system from A (best) to E.\n\n3. Can I track my history?\nYes, all your scans are saved in the History tab.\n\nContact us at support@nutriscan.ai for more help.",
            'Privacy Policy': "NutriScan Privacy Policy\n\nWe value your privacy. We do not sell your personal data. Your scan history is stored locally on your device unless you sync it with an account.\n\nWe collect anonymous usage data to improve our food database accuracy.",
            'Terms of Service': "NutriScan Terms of Service\n\nBy using NutriScan, you agree to our terms. This app provides nutritional information for educational purposes only. Always consult a healthcare professional for dietary advice.",
            'Rate NutriScan': "Love NutriScan?\n\nYour feedback helps us grow! Please consider leaving a review on the App Store or Google Play Store.",
            'Notifications': "You have no new notifications.\n\nEverything looks good! Keep scanning for personalized insights."
        };
        setContentTitle(title);
        setContentBody(bodyMap[title] || "Content loading...");
        setShowContentModal(true);
    };

    const renderSettingRow = (icon: string, label: string, value: boolean, onToggle: (v: boolean) => void) => (
        <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.bgSecondary }]}>
                    <Ionicons name={icon as any} size={20} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: COLORS.bgCardLight, true: COLORS.primary + '40' }}
                thumbColor={value ? COLORS.primary : '#A1A1AA'}
                ios_backgroundColor={COLORS.bgCardLight}
            />
        </View>
    );

    const renderMenuLink = (icon: string, label: string, onPress: () => void) => (
        <TouchableOpacity style={styles.settingRow} onPress={onPress}>
            <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.bgSecondary }]}>
                    <Ionicons name={icon as any} size={20} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
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
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerSubtitle}>User Settings</Text>
                            <Text style={styles.headerTitle}>Profile</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => showContent("Notifications")}
                        >
                            <Ionicons name="notifications-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Hero Card */}
                    <View style={styles.profileHero}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
                            style={styles.heroGlass}
                        >
                            <View style={styles.heroTop}>
                                <View style={styles.avatarWrapper}>
                                    <View style={styles.avatar}>
                                        <Ionicons name="person" size={40} color={COLORS.textMuted} />
                                    </View>
                                    <TouchableOpacity style={styles.editBadge}>
                                        <Ionicons name="camera" size={14} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.heroInfo}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.userName}>{userName}</Text>
                                        {isLoggedIn && (
                                            <TouchableOpacity onPress={handleEditName}>
                                                <Ionicons name="pencil-outline" size={16} color={COLORS.primary} style={{ marginLeft: 8 }} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <Text style={styles.userSub}>
                                        {isLoggedIn ? 'Account Synced' : 'Sign in to sync your data'}
                                    </Text>
                                    <TouchableOpacity style={styles.signInLink} onPress={handleSignIn}>
                                        <Text style={styles.signInText}>{isLoggedIn ? 'Sign Out' : 'Sign In'}</Text>
                                        <Ionicons name={isLoggedIn ? 'log-out-outline' : 'chevron-forward'} size={12} color={isLoggedIn ? COLORS.error : COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.statsBar}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>24</Text>
                                    <Text style={styles.statLabel}>Scans</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>18</Text>
                                    <Text style={styles.statLabel}>Healthy</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>5</Text>
                                    <Text style={styles.statLabel}>Favs</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Allergens Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>MY ALLERGENS</Text>
                            <View style={styles.titleDivider} />
                        </View>
                        <View style={styles.tagsContainer}>
                            {ALLERGENS.map(allergen => {
                                const isSelected = selectedAllergens.includes(allergen.id);
                                return (
                                    <TouchableOpacity
                                        key={allergen.id}
                                        style={[styles.tag, isSelected && styles.tagSelected]}
                                        onPress={() => toggleAllergen(allergen.id)}
                                    >
                                        <Text style={styles.tagIcon}>{allergen.icon}</Text>
                                        <Text style={[styles.tagLabel, isSelected && styles.tagLabelActive]}>
                                            {allergen.label}
                                        </Text>
                                        {isSelected && <Ionicons name="close-circle" size={14} color={COLORS.error} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Dietary Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>DIETARY PREFERENCES</Text>
                            <View style={styles.titleDivider} />
                        </View>
                        <View style={styles.tagsContainer}>
                            {DIETARY_PREFERENCES.map(diet => {
                                const isSelected = selectedDiets.includes(diet.id);
                                return (
                                    <TouchableOpacity
                                        key={diet.id}
                                        style={[styles.tag, isSelected && styles.tagSelectedGreen]}
                                        onPress={() => toggleDiet(diet.id)}
                                    >
                                        <Text style={styles.tagIcon}>{diet.icon}</Text>
                                        <Text style={[styles.tagLabel, isSelected && styles.tagLabelActiveGreen]}>
                                            {diet.label}
                                        </Text>
                                        {isSelected && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Settings Group */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>APP SETTINGS</Text>
                            <View style={styles.titleDivider} />
                        </View>
                        <View style={styles.glassContainer}>
                            {renderSettingRow('notifications-outline', 'Push Notifications', notifications, setNotifications)}
                            <View style={styles.listDivider} />
                            {renderSettingRow('volume-high-outline', 'Scan Sound', scanSound, setScanSound)}
                            <View style={styles.listDivider} />
                            {renderSettingRow('phone-portrait-outline', 'Haptic Feedback', hapticFeedback, setHapticFeedback)}
                        </View>
                    </View>

                    {/* Support Group */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>SUPPORT & PRIVACY</Text>
                            <View style={styles.titleDivider} />
                        </View>
                        <View style={styles.glassContainer}>
                            {renderMenuLink('help-circle-outline', 'Help & Support', () => showContent("Help & Support"))}
                            <View style={styles.listDivider} />
                            {renderMenuLink('document-text-outline', 'Privacy Policy', () => showContent("Privacy Policy"))}
                            <View style={styles.listDivider} />
                            {renderMenuLink('star-outline', 'Rate NutriScan', () => showContent("Rate NutriScan"))}
                        </View>
                    </View>

                    {/* Log Out */}
                    {isLoggedIn && (
                        <View style={styles.section}>
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={handleSignIn}
                            >
                                <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                                <Text style={styles.logoutText}>Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* App Info */}
                    <View style={styles.footer}>
                        <Text style={styles.version}>NutriScan Premium v1.0.0</Text>
                        <Text style={styles.credit}>Made with ❤️ for a healthier you</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Auth Modal */}
            <Modal
                visible={showAuthModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowAuthModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.authCard}>
                        <LinearGradient
                            colors={['#1E1E1E', '#121212']}
                            style={styles.authGradient}
                        >
                            <TouchableOpacity
                                style={styles.modalClose}
                                onPress={() => setShowAuthModal(false)}
                            >
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>

                            <Text style={styles.authTitle}>
                                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </Text>
                            <Text style={styles.authSub}>
                                {authMode === 'login'
                                    ? 'Sign in to access your synced health data.'
                                    : 'Join NutriScan to track your nutritional habits.'}
                            </Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <View style={styles.textInputWrapper}>
                                    <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="email@example.com"
                                        placeholderTextColor={COLORS.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={styles.textInputWrapper}>
                                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="••••••••"
                                        placeholderTextColor={COLORS.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.authButton}
                                onPress={handleAuthAction}
                                disabled={isAuthenticating}
                            >
                                <LinearGradient
                                    colors={GRADIENTS.premium as any}
                                    style={styles.authButtonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {isAuthenticating ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.authButtonText}>
                                            {authMode === 'login' ? 'Sign In' : 'Sign Up'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.toggleAuth}
                                onPress={() => {
                                    triggerHaptic();
                                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                }}
                            >
                                <Text style={styles.toggleText}>
                                    {authMode === 'login'
                                        ? "Don't have an account? Sign Up"
                                        : "Already have an account? Sign In"}
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>

            {/* Content Modal */}
            <Modal
                visible={showContentModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowContentModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.contentCard}>
                        <View style={styles.contentHeader}>
                            <View style={styles.dragIndicator} />
                            <View style={styles.contentTitleRow}>
                                <Text style={styles.contentTitleText}>{contentTitle}</Text>
                                <TouchableOpacity
                                    style={styles.smallClose}
                                    onPress={() => setShowContentModal(false)}
                                >
                                    <Ionicons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentPadding}>
                            <Text style={styles.contentBodyText}>{contentBody}</Text>

                            <TouchableOpacity
                                style={styles.dismissButton}
                                onPress={() => setShowContentModal(false)}
                            >
                                <Text style={styles.dismissText}>Got it</Text>
                            </TouchableOpacity>
                        </ScrollView>
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
    profileHero: {
        paddingHorizontal: SPACING.lg,
        marginBottom: 32,
    },
    heroGlass: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        ...SHADOWS.md,
    },
    heroTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.bgSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.bgCard,
    },
    heroInfo: {
        marginLeft: 20,
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 22,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
    },
    userSub: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    signInLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 4,
    },
    signInText: {
        fontSize: 14,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.primary,
    },
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        paddingVertical: 12,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    section: {
        marginBottom: 32,
        paddingHorizontal: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
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
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tagSelected: {
        backgroundColor: COLORS.error + '10',
        borderColor: COLORS.error + '40',
    },
    tagSelectedGreen: {
        backgroundColor: COLORS.primary + '10',
        borderColor: COLORS.primary + '40',
    },
    tagIcon: {
        fontSize: 14,
    },
    tagLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.medium,
    },
    tagLabelActive: {
        color: COLORS.error,
        fontWeight: FONT_WEIGHT.bold,
    },
    tagLabelActiveGreen: {
        color: COLORS.primary,
        fontWeight: FONT_WEIGHT.bold,
    },
    glassContainer: {
        backgroundColor: COLORS.bgCard,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.medium,
    },
    listDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 16,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    version: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: 'bold',
    },
    credit: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    authCard: {
        width: width * 0.9,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...SHADOWS.lg,
    },
    authGradient: {
        padding: 24,
    },
    modalClose: {
        alignSelf: 'flex-end',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    authTitle: {
        fontSize: 28,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
        marginTop: 8,
    },
    authSub: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 8,
        marginBottom: 24,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    textInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    textInput: {
        flex: 1,
        height: 50,
        color: '#fff',
        marginLeft: 12,
        fontSize: 16,
    },
    authButton: {
        marginTop: 12,
        borderRadius: 16,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    authButtonGradient: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: FONT_WEIGHT.bold,
    },
    toggleAuth: {
        marginTop: 20,
        alignItems: 'center',
    },
    toggleText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: FONT_WEIGHT.medium,
    },
    // Content Modal
    contentCard: {
        width: width,
        height: '70%',
        backgroundColor: COLORS.bgCard,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        position: 'absolute',
        bottom: 0,
    },
    contentHeader: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 20,
    },
    dragIndicator: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        marginBottom: 16,
    },
    contentTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 24,
    },
    contentTitleText: {
        fontSize: 20,
        fontWeight: FONT_WEIGHT.bold,
        color: '#fff',
    },
    smallClose: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentScroll: {
        flex: 1,
    },
    contentPadding: {
        padding: 24,
        paddingBottom: 40,
    },
    contentBodyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 26,
    },
    dismissButton: {
        marginTop: 40,
        backgroundColor: COLORS.bgSecondary,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    dismissText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: FONT_WEIGHT.bold,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.error + '10',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.error + '30',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.error,
    },
});

export default ProfileScreen;
