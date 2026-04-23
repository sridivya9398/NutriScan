import { Product, NutritionInfo, Warning } from '../types';

const BASE_URL = 'https://world.openbeautyfacts.org/api/v2';

interface OpenBeautyFactsProduct {
    code: string;
    product_name?: string;
    brands?: string;
    image_url?: string;
    image_front_url?: string;
    quantity?: string;
    categories_tags?: string[];
    ingredients_text?: string;
    ingredients_analysis_tags?: string[];
}

interface OpenBeautyFactsResponse {
    code: string;
    status: number;
    status_verbose: string;
    product?: OpenBeautyFactsProduct;
}

// Cosmetic ingredient risk database
const COSMETIC_INGREDIENT_RISKS: Record<string, { name: string; risk: 'none' | 'low' | 'moderate' | 'high'; concerns: string[] }> = {
    'parabens': { name: 'Parabens', risk: 'high', concerns: ['Endocrine disruptor', 'Potential hormone interference'] },
    'methylparaben': { name: 'Methylparaben', risk: 'moderate', concerns: ['Endocrine disruptor'] },
    'propylparaben': { name: 'Propylparaben', risk: 'high', concerns: ['Endocrine disruptor', 'Reproductive toxicity'] },
    'butylparaben': { name: 'Butylparaben', risk: 'high', concerns: ['Endocrine disruptor'] },
    'sodium lauryl sulfate': { name: 'SLS', risk: 'moderate', concerns: ['Skin irritant', 'May cause dryness'] },
    'sodium laureth sulfate': { name: 'SLES', risk: 'moderate', concerns: ['Skin irritant', 'May contain 1,4-dioxane'] },
    'phthalates': { name: 'Phthalates', risk: 'high', concerns: ['Endocrine disruptor', 'Reproductive toxicity'] },
    'triclosan': { name: 'Triclosan', risk: 'high', concerns: ['Endocrine disruptor', 'Environmental concern'] },
    'formaldehyde': { name: 'Formaldehyde', risk: 'high', concerns: ['Carcinogen', 'Skin sensitizer'] },
    'toluene': { name: 'Toluene', risk: 'high', concerns: ['Neurotoxin', 'Reproductive toxicity'] },
    'oxybenzone': { name: 'Oxybenzone', risk: 'high', concerns: ['Endocrine disruptor', 'Coral reef damage'] },
    'bht': { name: 'BHT', risk: 'moderate', concerns: ['Possible carcinogen', 'Endocrine disruptor'] },
    'bha': { name: 'BHA', risk: 'high', concerns: ['Possible carcinogen', 'Endocrine disruptor'] },
    'fragrance': { name: 'Fragrance/Parfum', risk: 'moderate', concerns: ['May contain allergens', 'Undisclosed ingredients'] },
    'talc': { name: 'Talc', risk: 'moderate', concerns: ['Possible asbestos contamination'] },
    'mineral oil': { name: 'Mineral Oil', risk: 'low', concerns: ['Petroleum derived', 'May clog pores'] },
    'dimethicone': { name: 'Dimethicone', risk: 'none', concerns: [] },
    'glycerin': { name: 'Glycerin', risk: 'none', concerns: [] },
    'hyaluronic acid': { name: 'Hyaluronic Acid', risk: 'none', concerns: [] },
    'retinol': { name: 'Retinol', risk: 'low', concerns: ['Sun sensitivity', 'Not for pregnant women'] },
    'niacinamide': { name: 'Niacinamide', risk: 'none', concerns: [] },
    'salicylic acid': { name: 'Salicylic Acid', risk: 'low', concerns: ['Sun sensitivity'] },
};

// Calculate cosmetic health score
function calculateCosmeticScore(ingredients?: string): number {
    if (!ingredients) return 50;

    let score = 100;
    const lowerIngredients = ingredients.toLowerCase();

    Object.entries(COSMETIC_INGREDIENT_RISKS).forEach(([key, info]) => {
        if (lowerIngredients.includes(key)) {
            switch (info.risk) {
                case 'high':
                    score -= 20;
                    break;
                case 'moderate':
                    score -= 10;
                    break;
                case 'low':
                    score -= 3;
                    break;
            }
        }
    });

    return Math.max(Math.round(score), 0);
}

// Generate warnings for cosmetics
function generateCosmeticWarnings(ingredients?: string): Warning[] {
    const warnings: Warning[] = [];
    if (!ingredients) return warnings;

    const lowerIngredients = ingredients.toLowerCase();

    Object.entries(COSMETIC_INGREDIENT_RISKS).forEach(([key, info]) => {
        if (lowerIngredients.includes(key) && (info.risk === 'high' || info.risk === 'moderate')) {
            warnings.push({
                type: 'additive',
                severity: info.risk === 'high' ? 'danger' : 'warning',
                title: `Contains ${info.name}`,
                description: info.concerns.join('. '),
            });
        }
    });

    return warnings;
}

// Fetch cosmetic product by barcode
export async function fetchCosmeticByBarcode(barcode: string): Promise<Product | null> {
    try {
        const response = await fetch(`${BASE_URL}/product/${barcode}.json`);
        const data: OpenBeautyFactsResponse = await response.json();

        if (data.status !== 1 || !data.product) {
            return null;
        }

        const p = data.product;

        const product: Product = {
            id: p.code,
            barcode: p.code,
            name: p.product_name || 'Unknown Product',
            brand: p.brands || 'Unknown Brand',
            imageUrl: p.image_front_url || p.image_url,
            quantity: p.quantity,
            categories: p.categories_tags?.map(c => c.replace('en:', '').replace(/-/g, ' ')),

            healthScore: calculateCosmeticScore(p.ingredients_text),

            nutrition: {} as NutritionInfo, // Cosmetics don't have nutrition
            ingredients: p.ingredients_text,

            warnings: generateCosmeticWarnings(p.ingredients_text),
            positives: [],
        };

        // Add positive notes for cosmetics
        if (product.healthScore >= 80) {
            product.positives?.push('Clean beauty formula');
        }
        if (product.ingredients?.toLowerCase().includes('organic')) {
            product.positives?.push('Contains organic ingredients');
        }
        if (product.ingredients?.toLowerCase().includes('vegan')) {
            product.positives?.push('Vegan friendly');
        }
        if (!product.ingredients?.toLowerCase().includes('paraben')) {
            product.positives?.push('Paraben-free');
        }

        return product;
    } catch (error) {
        console.error('Error fetching cosmetic product:', error);
        return null;
    }
}

// Search cosmetic products by name
export async function searchCosmeticProducts(query: string, page: number = 1): Promise<Product[]> {
    try {
        const response = await fetch(
            `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=20&json=true`
        );
        const data = await response.json();

        if (!data.products) return [];

        return data.products.slice(0, 20).map((p: OpenBeautyFactsProduct) => ({
            id: p.code,
            barcode: p.code,
            name: p.product_name || 'Unknown',
            brand: p.brands || 'Unknown',
            imageUrl: p.image_front_url,
            healthScore: calculateCosmeticScore(p.ingredients_text),
            nutrition: {},
        } as Product));
    } catch (error) {
        console.error('Error searching cosmetic products:', error);
        return [];
    }
}
