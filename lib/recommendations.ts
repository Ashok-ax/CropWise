import { CropCatalog } from '@/types/database';

export type RecommendationInput = {
  soilType: string | null;
  waterAvailability: string | null;
  season: string;
  budget: number | null;
  landArea: number | null;
  experience: string | null;
};

export type ScoredCrop = CropCatalog & {
  suitabilityScore: number;
  reasons: string[];
  estimatedInvestment: number | null;
  estimatedRevenue: number | null;
  estimatedProfit: number | null;
};

const WATER_MATCH: Record<string, string[]> = {
  Abundant: ['high', 'medium', 'low'],
  Moderate: ['medium', 'low'],
  Limited: ['low', 'medium'],
  Scarce: ['low'],
  'Rainfed only': ['low', 'medium'],
};

const EXPERIENCE_BONUS: Record<string, number> = {
  beginner: -5,
  intermediate: 0,
  experienced: 5,
};

export function recommendCrops(catalog: CropCatalog[], input: RecommendationInput): ScoredCrop[] {
  const waterAllowed = input.waterAvailability ? WATER_MATCH[input.waterAvailability] ?? ['low', 'medium', 'high'] : ['low', 'medium', 'high'];

  return catalog
    .map((crop) => {
      let score = 60;
      const reasons: string[] = [];

      const soilMatch = input.soilType
        ? crop.suitable_soil_types.some((s) => s.toLowerCase().includes(input.soilType!.toLowerCase()) || input.soilType!.toLowerCase().includes(s.toLowerCase()))
        : false;
      if (soilMatch) { score += 20; reasons.push(`Suited to ${input.soilType} soil`); }
      else { score -= 10; reasons.push('Soil match uncertain'); }

      const seasonMatch = crop.suitable_seasons.includes(input.season);
      if (seasonMatch) { score += 15; reasons.push(`Suitable for ${input.season} season`); }
      else { score -= 15; reasons.push(`Not a typical ${input.season} crop`); }

      const waterOk = waterAllowed.includes(crop.water_requirement);
      if (waterOk) { score += 15; reasons.push(`Water need (${crop.water_requirement}) matches your availability`); }
      else { score -= 20; reasons.push(`Water need (${crop.water_requirement}) may exceed availability`); }

      if (input.experience) score += EXPERIENCE_BONUS[input.experience] ?? 0;

      if (crop.difficulty === 'easy') score += 3;
      if (crop.difficulty === 'hard' && input.experience === 'beginner') score -= 8;

      const area = input.landArea && input.landArea > 0 ? input.landArea : 1;
      const estimatedInvestment = crop.estimated_investment_per_acre != null ? crop.estimated_investment_per_acre * area : null;
      const estimatedRevenue = crop.estimated_revenue_per_acre != null ? crop.estimated_revenue_per_acre * area : null;
      const estimatedProfit = estimatedInvestment != null && estimatedRevenue != null ? estimatedRevenue - estimatedInvestment : null;

      if (input.budget != null && estimatedInvestment != null) {
        if (estimatedInvestment <= input.budget) { score += 5; reasons.push('Within your budget'); }
        else { score -= 10; reasons.push('Exceeds your budget'); }
      }

      score = Math.max(5, Math.min(100, score));

      return { ...crop, suitabilityScore: score, reasons, estimatedInvestment, estimatedRevenue, estimatedProfit };
    })
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

export type SimScenario = {
  crop: ScoredCrop;
  rainfallChange: number;
  fertilizerPriceChange: number;
  marketPriceChange: number;
  irrigationReduction: number;
};

export function simulate(s: SimScenario) {
  let revenue = s.crop.estimatedRevenue ?? 0;
  let investment = s.crop.estimatedInvestment ?? 0;
  const notes: string[] = [];

  if (s.rainfallChange < 0) {
    const factor = 1 + s.rainfallChange / 100;
    if (s.crop.water_requirement === 'high') {
      revenue *= factor * 0.95;
      notes.push('High-water crop affected more by rainfall drop.');
    } else if (s.crop.water_requirement === 'medium') {
      revenue *= factor * 0.98;
    }
  }

  if (s.fertilizerPriceChange !== 0) {
    investment *= 1 + s.fertilizerPriceChange / 100 * 0.3;
    notes.push(`Fertilizer costs ~30% of input. Adjusted by ${s.fertilizerPriceChange}%.`);
  }

  if (s.marketPriceChange !== 0) {
    revenue *= 1 + s.marketPriceChange / 100;
    notes.push(`Market price adjusted by ${s.marketPriceChange}%.`);
  }

  if (s.irrigationReduction > 0) {
    if (s.crop.water_requirement === 'high') {
      revenue *= 1 - s.irrigationReduction / 100 * 0.5;
      notes.push('Irrigation reduction halves yield impact for high-water crop.');
    } else if (s.crop.water_requirement === 'low') {
      revenue *= 1 - s.irrigationReduction / 100 * 0.1;
      notes.push('Low-water crop is resilient to irrigation reduction.');
    }
  }

  return {
    adjustedInvestment: Math.round(investment),
    adjustedRevenue: Math.round(revenue),
    adjustedProfit: Math.round(revenue - investment),
    notes,
  };
}
