export const FARMING_TYPES = [
  { value: 'crop', label: 'Crop Farming' },
  { value: 'vegetable', label: 'Vegetable Farming' },
  { value: 'fruit', label: 'Fruit Farming' },
  { value: 'dairy', label: 'Dairy Farming' },
  { value: 'poultry', label: 'Poultry Farming' },
  { value: 'livestock', label: 'Livestock Farming' },
  { value: 'shepherding', label: 'Shepherding' },
  { value: 'fisheries', label: 'Fisheries' },
  { value: 'mixed', label: 'Mixed Farming' },
] as const;

export const SOIL_TYPES = [
  'Clay', 'Loam', 'Sandy', 'Sandy Loam', 'Black (Regur)', 'Alluvial', 'Red', 'Laterite', 'Peaty', 'Saline',
];

export const AREA_UNITS = ['acres', 'hectares', 'cents', 'sq_meters'] as const;

export const WATER_AVAILABILITY = ['Abundant', 'Moderate', 'Limited', 'Scarce', 'Rainfed only'] as const;

export const IRRIGATION_TYPES = [
  'Drip', 'Sprinkler', 'Flood', 'Furrow', 'Rainfed', 'Canal', 'Borewell', 'Open well',
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (3-10 years)' },
  { value: 'experienced', label: 'Experienced (10+ years)' },
] as const;

export const EXPENSE_CATEGORIES = [
  'Seeds', 'Fertilizer', 'Pesticides', 'Labour', 'Equipment', 'Electricity',
  'Fuel', 'Water', 'Transport', 'Animal feed', 'Veterinary', 'Poultry', 'Fisheries', 'Other',
] as const;

export const REVENUE_CATEGORIES = [
  'Crop sales', 'Milk', 'Eggs', 'Meat', 'Livestock', 'Fish', 'Other',
] as const;

export const REMINDER_TYPES = [
  'Irrigation', 'Fertilizer', 'Pesticide', 'Harvest', 'Vaccination',
  'Animal feeding', 'Govt. application deadline', 'Soil test', 'Other',
] as const;

export const GROWTH_STAGES = [
  'planned', 'seedling', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvested', 'failed',
] as const;

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'Tamil' },
  { value: 'hi', label: 'Hindi' },
] as const;

export const LIVESTOCK_SPECIES = [
  'Cattle (Cow)', 'Buffalo', 'Goat', 'Sheep', 'Pig', 'Horse', 'Donkey', 'Other',
] as const;

export const POULTRY_PURPOSES = ['Layer (eggs)', 'Broiler (meat)', 'Dual purpose', 'Breeding'] as const;

export const FISH_SPECIES = [
  'Rohu', 'Catla', 'Mrigal', 'Tilapia', 'Pangasius', 'Common Carp', 'Grass Carp', 'Other',
] as const;

export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const SEASONS = ['kharif', 'rabi', 'summer', 'monsoon', 'winter', 'spring'] as const;
