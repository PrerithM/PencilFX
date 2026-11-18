import { ColorMode, SideMode, PaperSize, FinishingType, PricingConfig } from '../types';
import { FALLBACK_PRICING } from '../services/dataService';

export interface PricingBreakdown {
  ratePerPage: number;
  basePagesCost: number;
  sizeMultiplier: number;
  finishingCost: number;
  copies: number;
  totalCost: number;
}

/**
 * Calculates print job cost based on structured pricing configuration
 */
export function calculatePrintCost(
  params: {
    pageCount: number;
    colorMode: ColorMode;
    sides: SideMode;
    paperSize: PaperSize;
    finishing: FinishingType;
    copies: number;
  },
  config: PricingConfig = FALLBACK_PRICING
): PricingBreakdown {
  const { pageCount, colorMode, sides, paperSize, finishing, copies } = params;

  const validPages = Math.max(1, pageCount || 1);
  const validCopies = Math.max(1, copies || 1);

  // Rate lookup key e.g. "bw_single", "bw_double", "color_single", "color_double"
  const rateKey = `${colorMode}_${sides}` as keyof typeof config.rates;
  const ratePerPage = config.rates[rateKey]?.rate ?? (colorMode === 'bw' ? (sides === 'double' ? 1.5 : 2.0) : 8.0);

  // Paper size multiplier
  const sizeMultiplier = config.paperSizes[paperSize]?.multiplier ?? (paperSize === 'A3' ? 2.0 : 1.0);

  // Finishing price
  const finishingCost = config.finishing[finishing]?.price ?? 0.0;

  const basePagesCost = validPages * ratePerPage * sizeMultiplier;
  const totalCost = (basePagesCost + finishingCost) * validCopies;

  return {
    ratePerPage,
    basePagesCost,
    sizeMultiplier,
    finishingCost,
    copies: validCopies,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}
