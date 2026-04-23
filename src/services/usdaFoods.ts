import { Product, NutritionInfo } from '../types';

// USDA FoodData Central API
// Free API for generic/unpacked foods (grains, millets, vegetables, etc.)
const USDA_API_KEY = 'DEMO_KEY'; // Use DEMO_KEY for testing, limited to 30 requests/hour
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

interface USDAFood {
    fdcId: number;
    description: string;
    dataType: string;
    brandOwner?: string;
    foodCategory?: string;
    foodNutrients: USDANutrient[];
}

interface USDANutrient {
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
}

interface USDASearchResponse {
    totalHits: number;
    currentPage: number;
    totalPages: number;
    foods: USDAFood[];
}

// Common nutrient IDs in USDA database
const NUTRIENT_IDS = {
    calories: 1008,      // Energy (kcal)
    protein: 1003,       // Protein
    fat: 1004,           // Total lipid (fat)
    carbs: 1005,         // Carbohydrate
    fiber: 1079,         // Fiber
    sugars: 2000,        // Total Sugars
    sodium: 1093,        // Sodium
    calcium: 1087,       // Calcium
    iron: 1089,          // Iron
    vitaminC: 1162,      // Vitamin C
    vitaminA: 1106,      // Vitamin A
};

// Extract nutrient value by ID
function getNutrientValue(nutrients: USDANutrient[], nutrientId: number): number | undefined {
    const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
    return nutrient?.value;
}

// Calculate health score for unpacked foods (generally healthier)
function calculateUnpackedHealthScore(food: USDAFood): number {
    let score = 70; // Base score for whole foods

    const nutrients = food.foodNutrients;
    const fiber = getNutrientValue(nutrients, NUTRIENT_IDS.fiber) || 0;
    const protein = getNutrientValue(nutrients, NUTRIENT_IDS.protein) || 0;
    const sugars = getNutrientValue(nutrients, NUTRIENT_IDS.sugars) || 0;
    const sodium = getNutrientValue(nutrients, NUTRIENT_IDS.sodium) || 0;

    // Bonus for fiber
    if (fiber > 5) score += 10;
    else if (fiber > 2) score += 5;

    // Bonus for protein
    if (protein > 10) score += 10;
    else if (protein > 5) score += 5;

    // Penalty for high sugar
    if (sugars > 15) score -= 10;
    else if (sugars > 10) score -= 5;

    // Penalty for high sodium
    if (sodium > 500) score -= 10;
    else if (sodium > 200) score -= 5;

    // Category bonuses
    const category = food.foodCategory?.toLowerCase() || '';
    if (category.includes('vegetable')) score += 10;
    if (category.includes('fruit')) score += 5;
    if (category.includes('legume') || category.includes('bean')) score += 8;
    if (category.includes('grain') || category.includes('cereal')) score += 5;

    return Math.min(Math.max(Math.round(score), 0), 100);
}

// Convert USDA food to our Product type
function convertUSDAToProduct(food: USDAFood): Product {
    const nutrients = food.foodNutrients;

    const nutrition: NutritionInfo = {
        calories: getNutrientValue(nutrients, NUTRIENT_IDS.calories),
        protein: getNutrientValue(nutrients, NUTRIENT_IDS.protein),
        fat: getNutrientValue(nutrients, NUTRIENT_IDS.fat),
        carbohydrates: getNutrientValue(nutrients, NUTRIENT_IDS.carbs),
        fiber: getNutrientValue(nutrients, NUTRIENT_IDS.fiber),
        sugars: getNutrientValue(nutrients, NUTRIENT_IDS.sugars),
        sodium: getNutrientValue(nutrients, NUTRIENT_IDS.sodium),
    };

    const healthScore = calculateUnpackedHealthScore(food);

    // Determine Nutri-Score based on health score
    let nutriScore: Product['nutriScore'];
    if (healthScore >= 80) nutriScore = 'a';
    else if (healthScore >= 65) nutriScore = 'b';
    else if (healthScore >= 50) nutriScore = 'c';
    else if (healthScore >= 35) nutriScore = 'd';
    else nutriScore = 'e';

    const positives: string[] = [];
    if (nutrition.fiber && nutrition.fiber > 5) positives.push('High in fiber');
    if (nutrition.protein && nutrition.protein > 10) positives.push('Good source of protein');
    if (food.foodCategory?.toLowerCase().includes('vegetable')) {
        positives.push('Fresh vegetable - nutrient dense');
    }
    if (food.dataType === 'SR Legacy' || food.dataType === 'Foundation') {
        positives.push('Whole/unprocessed food');
    }

    return {
        id: `usda-${food.fdcId}`,
        barcode: '',
        name: food.description,
        brand: food.brandOwner || 'Generic / Unpackaged',
        categories: food.foodCategory ? [food.foodCategory] : [],
        healthScore,
        nutriScore,
        novaGroup: 1, // Unprocessed foods are NOVA 1
        nutrition,
        positives,
        warnings: [],
    };
}

// Search for unpacked/generic foods
export async function searchUnpackedFoods(query: string, pageSize: number = 20): Promise<Product[]> {
    try {
        const response = await fetch(
            `${USDA_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=${pageSize}&dataType=SR Legacy,Foundation`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.error('USDA API error:', response.status);
            return [];
        }

        const data: USDASearchResponse = await response.json();

        if (!data.foods || data.foods.length === 0) {
            return [];
        }

        return data.foods.map(convertUSDAToProduct);
    } catch (error) {
        console.error('Error searching USDA foods:', error);
        return [];
    }
}

// Get specific food by USDA FDC ID
export async function getUnpackedFoodById(fdcId: string): Promise<Product | null> {
    try {
        const id = fdcId.replace('usda-', '');
        const response = await fetch(
            `${USDA_BASE_URL}/food/${id}?api_key=${USDA_API_KEY}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return null;
        }

        const food: USDAFood = await response.json();
        return convertUSDAToProduct(food);
    } catch (error) {
        console.error('Error fetching USDA food:', error);
        return null;
    }
}

// Common unpacked food categories for quick access
export const UNPACKED_FOOD_CATEGORIES = [
    { id: 'grains', label: 'Grains & Rice', icon: '🌾', searchTerm: 'rice grain' },
    { id: 'millets', label: 'Millets', icon: '🌱', searchTerm: 'millet' },
    { id: 'vegetables', label: 'Vegetables', icon: '🥬', searchTerm: 'vegetable raw' },
    { id: 'fruits', label: 'Fruits', icon: '🍎', searchTerm: 'fruit raw' },
    { id: 'legumes', label: 'Legumes & Beans', icon: '🫘', searchTerm: 'beans lentils' },
    { id: 'nuts', label: 'Nuts & Seeds', icon: '🥜', searchTerm: 'nuts peanuts seeds' },
    { id: 'leafy', label: 'Leafy Greens', icon: '🥗', searchTerm: 'spinach kale lettuce' },
    { id: 'spices', label: 'Spices & Herbs', icon: '🌿', searchTerm: 'spice herb' },
];
