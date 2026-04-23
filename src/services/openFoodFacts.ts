import { Product, NutritionInfo, Additive, Warning } from '../types';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

interface OpenFoodFactsProduct {
    code: string;
    product_name?: string;
    brands?: string;
    image_url?: string;
    image_front_url?: string;
    quantity?: string;
    categories_tags?: string[];
    nutriscore_grade?: string;
    nova_group?: number;
    ecoscore_grade?: string;
    nutriments?: {
        'energy-kcal_100g'?: number;
        fat_100g?: number;
        'saturated-fat_100g'?: number;
        carbohydrates_100g?: number;
        sugars_100g?: number;
        fiber_100g?: number;
        proteins_100g?: number;
        salt_100g?: number;
        sodium_100g?: number;
    };
    ingredients_text?: string;
    additives_tags?: string[];
    allergens_tags?: string[];
    nutrition_grades?: string;
}

interface OpenFoodFactsResponse {
    code: string;
    status: number;
    status_verbose: string;
    product?: OpenFoodFactsProduct;
}

// Additive risk database (simplified)
const ADDITIVE_RISKS: Record<string, { name: string; risk: 'none' | 'low' | 'moderate' | 'high'; concerns: string[] }> = {
    'en:e100': { name: 'Curcumin', risk: 'none', concerns: [] },
    'en:e150a': { name: 'Caramel Color', risk: 'low', concerns: ['May contain contaminants'] },
    'en:e211': { name: 'Sodium Benzoate', risk: 'moderate', concerns: ['May cause hyperactivity', 'Benzene formation risk'] },
    'en:e250': { name: 'Sodium Nitrite', risk: 'high', concerns: ['Linked to cancer risk', 'Forms nitrosamines'] },
    'en:e621': { name: 'Monosodium Glutamate', risk: 'moderate', concerns: ['May cause headaches in sensitive individuals'] },
    'en:e951': { name: 'Aspartame', risk: 'moderate', concerns: ['Controversial artificial sweetener'] },
    'en:e102': { name: 'Tartrazine', risk: 'moderate', concerns: ['May cause hyperactivity', 'Allergic reactions'] },
    'en:e320': { name: 'BHA', risk: 'high', concerns: ['Possible carcinogen', 'Endocrine disruptor'] },
    'en:e321': { name: 'BHT', risk: 'moderate', concerns: ['Possible endocrine disruptor'] },
    'en:e171': { name: 'Titanium Dioxide', risk: 'high', concerns: ['Banned in EU', 'Potential health risks'] },
};

// Calculate health score based on multiple factors
function calculateHealthScore(product: OpenFoodFactsProduct): number {
    let score = 50; // Base score

    // Nutri-Score contribution (40%)
    if (product.nutriscore_grade) {
        const nutriScores: Record<string, number> = { a: 40, b: 32, c: 20, d: 10, e: 0 };
        score = nutriScores[product.nutriscore_grade] || 20;
    }

    // NOVA Group contribution (15%)
    if (product.nova_group) {
        const novaScores: Record<number, number> = { 1: 15, 2: 11, 3: 7, 4: 0 };
        score += novaScores[product.nova_group] || 7;
    } else {
        score += 7;
    }

    // Additives penalty (25%)
    const additiveCount = product.additives_tags?.length || 0;
    const highRiskAdditives = product.additives_tags?.filter(a =>
        ADDITIVE_RISKS[a]?.risk === 'high'
    ).length || 0;

    let additivePenalty = 0;
    additivePenalty += Math.min(additiveCount * 2, 15);
    additivePenalty += highRiskAdditives * 5;
    score += Math.max(25 - additivePenalty, 0);

    // Eco-Score contribution (10%)
    if (product.ecoscore_grade) {
        const ecoScores: Record<string, number> = { a: 10, b: 8, c: 5, d: 2, e: 0 };
        score += ecoScores[product.ecoscore_grade] || 5;
    } else {
        score += 5;
    }

    // Organic bonus (10%)
    const isOrganic = product.categories_tags?.some(c =>
        c.includes('organic') || c.includes('bio')
    );
    if (isOrganic) score += 10;

    return Math.min(Math.max(Math.round(score), 0), 100);
}

// Generate warnings based on product data
function generateWarnings(product: OpenFoodFactsProduct): Warning[] {
    const warnings: Warning[] = [];

    // NOVA Group warning
    if (product.nova_group === 4) {
        warnings.push({
            type: 'processing',
            severity: 'warning',
            title: 'Ultra-Processed Food',
            description: 'This product is classified as ultra-processed (NOVA 4). Consider less processed alternatives.',
        });
    }

    // High-risk additives
    product.additives_tags?.forEach(additive => {
        const info = ADDITIVE_RISKS[additive];
        if (info?.risk === 'high') {
            warnings.push({
                type: 'additive',
                severity: 'danger',
                title: `Contains ${info.name}`,
                description: info.concerns.join('. '),
            });
        }
    });

    // Nutrition warnings
    const nutriments = product.nutriments;
    if (nutriments) {
        if (nutriments.sugars_100g && nutriments.sugars_100g > 22.5) {
            warnings.push({
                type: 'nutrition',
                severity: 'warning',
                title: 'High Sugar',
                description: `Contains ${nutriments.sugars_100g.toFixed(1)}g of sugar per 100g (high).`,
            });
        }
        if (nutriments.salt_100g && nutriments.salt_100g > 1.5) {
            warnings.push({
                type: 'nutrition',
                severity: 'warning',
                title: 'High Salt',
                description: `Contains ${nutriments.salt_100g.toFixed(1)}g of salt per 100g (high).`,
            });
        }
        if (nutriments['saturated-fat_100g'] && nutriments['saturated-fat_100g'] > 5) {
            warnings.push({
                type: 'nutrition',
                severity: 'info',
                title: 'High Saturated Fat',
                description: `Contains ${nutriments['saturated-fat_100g'].toFixed(1)}g of saturated fat per 100g.`,
            });
        }
    }

    return warnings;
}

// Parse additives from Open Food Facts
function parseAdditives(additiveTags?: string[]): Additive[] {
    if (!additiveTags) return [];

    return additiveTags.map(tag => {
        const info = ADDITIVE_RISKS[tag];
        const code = tag.replace('en:', '').toUpperCase();

        return {
            code,
            name: info?.name || code,
            riskLevel: info?.risk || 'low',
            concerns: info?.concerns || [],
        };
    });
}

// Main API function to fetch product by barcode
export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
    try {
        const response = await fetch(`${BASE_URL}/product/${barcode}.json`);
        const data: OpenFoodFactsResponse = await response.json();

        if (data.status !== 1 || !data.product) {
            return null;
        }

        const p = data.product;
        const nutriments = p.nutriments || {};

        const nutrition: NutritionInfo = {
            calories: nutriments['energy-kcal_100g'],
            fat: nutriments.fat_100g,
            saturatedFat: nutriments['saturated-fat_100g'],
            carbohydrates: nutriments.carbohydrates_100g,
            sugars: nutriments.sugars_100g,
            fiber: nutriments.fiber_100g,
            protein: nutriments.proteins_100g,
            salt: nutriments.salt_100g,
            sodium: nutriments.sodium_100g,
        };

        const product: Product = {
            id: p.code,
            barcode: p.code,
            name: p.product_name || 'Unknown Product',
            brand: p.brands || 'Unknown Brand',
            imageUrl: p.image_front_url || p.image_url,
            quantity: p.quantity,
            categories: p.categories_tags?.map(c => c.replace('en:', '').replace(/-/g, ' ')),

            healthScore: calculateHealthScore(p),
            nutriScore: p.nutriscore_grade as Product['nutriScore'],
            novaGroup: p.nova_group as Product['novaGroup'],
            ecoScore: p.ecoscore_grade as Product['ecoScore'],

            nutrition,
            ingredients: p.ingredients_text,
            additives: parseAdditives(p.additives_tags),
            allergens: p.allergens_tags?.map(a => a.replace('en:', '')),

            warnings: generateWarnings(p),
            positives: [],
        };

        // Add positive notes
        if (product.healthScore >= 75) {
            product.positives?.push('Excellent overall health score');
        }
        if (product.novaGroup === 1) {
            product.positives?.push('Unprocessed or minimally processed');
        }
        if (nutrition.fiber && nutrition.fiber > 6) {
            product.positives?.push('High in fiber');
        }
        if (nutrition.protein && nutrition.protein > 10) {
            product.positives?.push('Good source of protein');
        }

        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

// Search products by name
export async function searchProducts(query: string, page: number = 1): Promise<Product[]> {
    try {
        const response = await fetch(
            `${BASE_URL}/search?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=20&json=true`
        );
        const data = await response.json();

        if (!data.products) return [];

        return data.products.slice(0, 20).map((p: OpenFoodFactsProduct) => ({
            id: p.code,
            barcode: p.code,
            name: p.product_name || 'Unknown',
            brand: p.brands || 'Unknown',
            imageUrl: p.image_front_url,
            healthScore: calculateHealthScore(p),
            nutriScore: p.nutriscore_grade,
            novaGroup: p.nova_group,
            nutrition: {
                calories: p.nutriments?.['energy-kcal_100g'],
            },
        } as Product));
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
}

// Search products by category
export async function searchProductsByCategory(category: string, page: number = 1): Promise<Product[]> {
    try {
        // Map category IDs to Open Food Facts category tags
        const categoryMap: Record<string, string> = {
            'breakfast': 'en:breakfasts',
            'snacks': 'en:snacks',
            'beverages': 'en:beverages',
            'dairy': 'en:dairies',
            'bakery': 'en:breads',
            'frozen': 'en:frozen-foods',
            'organic': 'en:organic-foods',
            'baby': 'en:baby-foods',
            'skincare': 'en:face-creams',
            'haircare': 'en:shampoos',
            'makeup': 'en:makeup',
            'bodycare': 'en:body-creams',
            'suncare': 'en:sunscreens',
            'deodorant': 'en:deodorants',
            'toothpaste': 'en:toothpastes',
            'baby-care': 'en:baby-care',
        };

        const categoryTag = categoryMap[category] || `en:${category}`;

        const response = await fetch(
            `${BASE_URL}/search?categories_tags=${categoryTag}&page=${page}&page_size=20&json=true`
        );
        const data = await response.json();

        if (!data.products) return [];

        return data.products.slice(0, 20).map((p: OpenFoodFactsProduct) => ({
            id: p.code,
            barcode: p.code,
            name: p.product_name || 'Unknown',
            brand: p.brands || 'Unknown',
            imageUrl: p.image_front_url,
            healthScore: calculateHealthScore(p),
            nutriScore: p.nutriscore_grade,
            novaGroup: p.nova_group,
            nutrition: {
                calories: p.nutriments?.['energy-kcal_100g'],
                protein: p.nutriments?.proteins_100g,
                sugars: p.nutriments?.sugars_100g,
                fat: p.nutriments?.fat_100g,
                saturatedFat: p.nutriments?.['saturated-fat_100g'],
                carbohydrates: p.nutriments?.carbohydrates_100g,
                fiber: p.nutriments?.fiber_100g,
                salt: p.nutriments?.salt_100g,
                sodium: p.nutriments?.sodium_100g,
            },
        } as Product));
    } catch (error) {
        console.error('Error searching by category:', error);
        return [];
    }
}

