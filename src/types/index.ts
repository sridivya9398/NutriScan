// Product Types
export interface Product {
    id: string;
    barcode: string;
    name: string;
    brand: string;
    imageUrl?: string;
    quantity?: string;
    categories?: string[];

    // Scores
    healthScore: number;
    nutriScore?: 'a' | 'b' | 'c' | 'd' | 'e';
    novaGroup?: 1 | 2 | 3 | 4;
    ecoScore?: 'a' | 'b' | 'c' | 'd' | 'e';

    // Nutrition
    nutrition: NutritionInfo;

    // Ingredients
    ingredients?: string;
    ingredientsList?: Ingredient[];
    additives?: Additive[];
    allergens?: string[];

    // Analysis
    warnings?: Warning[];
    positives?: string[];
}

export interface NutritionInfo {
    servingSize?: string;
    calories?: number;

    // Macros (per 100g)
    fat?: number;
    saturatedFat?: number;
    carbohydrates?: number;
    sugars?: number;
    fiber?: number;
    protein?: number;
    salt?: number;
    sodium?: number;

    // Micronutrients (optional)
    vitamins?: VitaminInfo[];
    minerals?: MineralInfo[];
}

export interface VitaminInfo {
    name: string;
    amount: number;
    unit: string;
    dailyValue?: number;
}

export interface MineralInfo {
    name: string;
    amount: number;
    unit: string;
    dailyValue?: number;
}

export interface Ingredient {
    id: string;
    name: string;
    percentage?: number;
    isAdditive?: boolean;
    riskLevel?: 'none' | 'low' | 'moderate' | 'high';
}

export interface Additive {
    code: string;
    name: string;
    riskLevel: 'none' | 'low' | 'moderate' | 'high';
    description?: string;
    concerns?: string[];
}

export interface Warning {
    type: 'allergen' | 'additive' | 'nutrition' | 'processing' | 'contaminant';
    severity: 'info' | 'warning' | 'danger';
    title: string;
    description: string;
    icon?: string;
}

// User Types
export interface UserProfile {
    id: string;
    email?: string;
    displayName?: string;

    // Dietary preferences
    allergens: string[];
    dietaryPreferences: DietaryPreference[];
    nutritionGoals?: NutritionGoals;

    // Premium
    isPremium: boolean;
    premiumExpiresAt?: Date;
}

export type DietaryPreference =
    | 'vegetarian'
    | 'vegan'
    | 'gluten-free'
    | 'lactose-free'
    | 'keto'
    | 'paleo'
    | 'low-sodium'
    | 'low-sugar'
    | 'halal'
    | 'kosher';

export interface NutritionGoals {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
}

// Scan History
export interface ScanHistoryItem {
    id: string;
    product: Product;
    scannedAt: Date;
    isFavorite: boolean;
}

// Alternative Products
export interface AlternativeProduct extends Product {
    scoreDifference: number;
    reason: string;
    availability?: string;
}

// Navigation Types
export type RootStackParamList = {
    MainTabs: undefined;
    ProductDetail: { product: Product };
    Scanner: undefined;
    AlternativesList: { product: Product };
    Settings: undefined;
    AllergenSetup: undefined;
    Onboarding: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Scan: undefined;
    History: undefined;
    Discover: undefined;
    Profile: undefined;
};
