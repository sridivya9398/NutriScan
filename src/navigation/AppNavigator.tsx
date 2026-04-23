import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { HomeScreen } from '../screens/HomeScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { COLORS, GRADIENTS, SHADOWS } from '../constants/theme';
import { RootStackParamList, MainTabParamList, Product } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

interface MainTabsProps {
    recentScans: Product[];
    onProductScanned: (product: Product) => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ recentScans, onProductScanned }) => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'rgba(15, 15, 15, 0.95)',
                    borderTopColor: 'rgba(255, 255, 255, 0.05)',
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 90 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
                    paddingTop: 12,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Scan') {
                        iconName = 'scan';
                    } else if (route.name === 'History') {
                        iconName = focused ? 'time' : 'time-outline';
                    } else if (route.name === 'Discover') {
                        iconName = focused ? 'compass' : 'compass-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    if (route.name === 'Scan') {
                        return (
                            <View style={styles.scanContainer}>
                                <LinearGradient
                                    colors={GRADIENTS.premium as any}
                                    style={styles.scanIcon}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Ionicons name={iconName} size={28} color="#fff" />
                                </LinearGradient>
                            </View>
                        );
                    }

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home">
                {(props) => <HomeScreen {...props} recentScans={recentScans} />}
            </Tab.Screen>
            <Tab.Screen name="History">
                {(props) => <HistoryScreen {...props} scanHistory={recentScans} />}
            </Tab.Screen>
            <Tab.Screen
                name="Scan"
                options={{
                    tabBarLabel: () => null,
                }}
            >
                {(props) => <ScannerScreen {...props} onProductScanned={onProductScanned} />}
            </Tab.Screen>
            <Tab.Screen name="Discover" component={DiscoverScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export const AppNavigator: React.FC = () => {
    const [recentScans, setRecentScans] = React.useState<Product[]>([]);

    const handleProductScanned = (product: Product) => {
        setRecentScans(prev => [product, ...prev.filter(p => p.id !== product.id)].slice(0, 20));
    };

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: COLORS.bgPrimary },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="MainTabs">
                    {(props) => (
                        <MainTabs
                            {...props}
                            recentScans={recentScans}
                            onProductScanned={handleProductScanned}
                        />
                    )}
                </Stack.Screen>
                <Stack.Screen
                    name="Scanner"
                    options={{
                        animation: 'slide_from_bottom',
                        presentation: 'fullScreenModal',
                    }}
                >
                    {(props) => (
                        <ScannerScreen
                            {...props}
                            onProductScanned={handleProductScanned}
                        />
                    )}
                </Stack.Screen>
                <Stack.Screen
                    name="ProductDetail"
                    component={ProductDetailScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    scanContainer: {
        top: -24,
        ...SHADOWS.lg,
    },
    scanIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: COLORS.bgSecondary,
    },
});

export default AppNavigator;

