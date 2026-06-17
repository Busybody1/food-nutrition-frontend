/** Trimmed barcode lookup example for docs (Nutella via Open Food Facts fallback). */
export const BARCODE_LOOKUP_EXAMPLE = {
  barcode: '3017620422003',
  product: {
    name: 'Nutella',
    brand: 'Nutella',
    category: 'Pâtes à tartiner aux noisettes et au cacao, en:Pâtes à tartiner',
    generic_name: 'Pâte à tartiner aux noisettes et au cacao',
    quantity: null,
    ingredients:
      'sugar, palm oil, hazelnuts 13%, low-fat cocoa 7.4%, skimmed milk powder 6.6%, whey powder, emulsifiers: lecithins [soya], vanillin, gluten-free,',
    allergens: ['milk', 'nuts', 'soybeans'],
  },
  serving: {
    label: '100g',
    quantity: null,
    unit: 'g',
  },
  nutrition_per_100g: {
    energy_kcal: 539,
    protein_g: 6.3,
    carbohydrates_g: 57.5,
    fat_g: 30.9,
    fiber_g: null,
    sugars_g: 56.3,
    saturated_fat_g: 10.6,
    salt_g: 0.107,
    sodium_g: 0.0428,
    added_sugars_g: 38.35,
  },
  nutrition_per_serving: null,
  micronutrients_per_100g: [],
} as const

export const BARCODE_LOOKUP_FIELDS = [
  { field: 'barcode', description: 'Normalized UPC/EAN digits' },
  { field: 'product.name', description: 'Product title' },
  { field: 'product.brand', description: 'Primary brand name' },
  { field: 'product.category', description: 'Food category label' },
  { field: 'product.generic_name', description: 'Short product description when available' },
  { field: 'product.quantity', description: 'Package size when available' },
  { field: 'product.ingredients', description: 'Ingredients text' },
  { field: 'product.allergens', description: 'Allergen list' },
  { field: 'serving.label', description: 'Human-readable serving size' },
  { field: 'serving.quantity', description: 'Numeric serving amount when available' },
  { field: 'serving.unit', description: 'Serving unit (g, ml, etc.)' },
  {
    field: 'nutrition_per_100g',
    description:
      'Macros per 100 g: energy_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sugars_g, saturated_fat_g, salt_g, sodium_g, added_sugars_g',
  },
  {
    field: 'nutrition_per_serving',
    description: 'Same macro fields per labeled serving when Open Food Facts provides serving data',
  },
  {
    field: 'micronutrients_per_100g',
    description: 'Vitamins and minerals per 100 g when present (name, amount, unit)',
  },
] as const

export const BARCODE_LOOKUP_EXAMPLE_JSON = JSON.stringify(BARCODE_LOOKUP_EXAMPLE, null, 2)
