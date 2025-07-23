export interface ProfitMarginCalculation {
  id: string;
  costPrice: number;
  desiredMarginPercent: number;
  gstRate: number;
  businessType: 'B2B' | 'B2C';
  
  // Calculated values
  sellingPriceBeforeGST: number;
  gstAmount: number;
  finalSellingPrice: number;
  profitAmount: number;
  effectiveMarginPercent: number;
  
  // Metadata
  timestamp: Date;
  description?: string;
}

export interface MarginPreset {
  id: string;
  name: string;
  marginPercent: number;
  businessType: 'B2B' | 'B2C';
  description?: string;
  isDefault?: boolean;
}

export interface MarginComparison {
  scenarios: ProfitMarginCalculation[];
  bestScenario?: ProfitMarginCalculation;
  recommendations: string[];
}

export interface PricingStrategy {
  type: 'cost_plus' | 'competitive' | 'value_based' | 'penetration' | 'skimming';
  name: string;
  description: string;
  recommendedMargin: {
    min: number;
    max: number;
  };
}

// Common pricing strategies
export const PRICING_STRATEGIES: PricingStrategy[] = [
  {
    type: 'cost_plus',
    name: 'Cost-Plus Pricing',
    description: 'Add a fixed margin to cost price',
    recommendedMargin: { min: 20, max: 50 }
  },
  {
    type: 'competitive',
    name: 'Competitive Pricing',
    description: 'Price based on market competition',
    recommendedMargin: { min: 15, max: 35 }
  },
  {
    type: 'value_based',
    name: 'Value-Based Pricing',
    description: 'Price based on perceived customer value',
    recommendedMargin: { min: 30, max: 80 }
  },
  {
    type: 'penetration',
    name: 'Market Penetration',
    description: 'Lower margins to gain market share',
    recommendedMargin: { min: 10, max: 25 }
  },
  {
    type: 'skimming',
    name: 'Price Skimming',
    description: 'High margins for premium positioning',
    recommendedMargin: { min: 40, max: 100 }
  }
];

// Default margin presets
export const DEFAULT_MARGIN_PRESETS: MarginPreset[] = [
  {
    id: 'retail_standard',
    name: 'Retail Standard',
    marginPercent: 25,
    businessType: 'B2C',
    description: 'Standard retail markup',
    isDefault: true
  },
  {
    id: 'wholesale_standard',
    name: 'Wholesale Standard',
    marginPercent: 15,
    businessType: 'B2B',
    description: 'Standard wholesale markup',
    isDefault: true
  },
  {
    id: 'premium_retail',
    name: 'Premium Retail',
    marginPercent: 40,
    businessType: 'B2C',
    description: 'Premium product markup'
  },
  {
    id: 'bulk_wholesale',
    name: 'Bulk Wholesale',
    marginPercent: 10,
    businessType: 'B2B',
    description: 'High volume, low margin'
  },
  {
    id: 'luxury_goods',
    name: 'Luxury Goods',
    marginPercent: 60,
    businessType: 'B2C',
    description: 'Luxury product positioning'
  }
];

/**
 * Calculate profit margin and pricing details
 */
export function calculateProfitMargin(
  costPrice: number,
  desiredMarginPercent: number,
  gstRate: number,
  businessType: 'B2B' | 'B2C' = 'B2C'
): ProfitMarginCalculation {
  // Validate inputs
  if (costPrice <= 0) throw new Error('Cost price must be greater than 0');
  if (desiredMarginPercent < 0) throw new Error('Margin percentage cannot be negative');
  if (gstRate < 0) throw new Error('GST rate cannot be negative');

  // Calculate selling price before GST to achieve desired margin
  const sellingPriceBeforeGST = costPrice / (1 - desiredMarginPercent / 100);
  
  // Calculate GST amount
  const gstAmount = (sellingPriceBeforeGST * gstRate) / 100;
  
  // Calculate final selling price (including GST)
  const finalSellingPrice = sellingPriceBeforeGST + gstAmount;
  
  // Calculate actual profit amount
  const profitAmount = sellingPriceBeforeGST - costPrice;
  
  // Calculate effective margin percentage (considering GST impact)
  const effectiveMarginPercent = (profitAmount / finalSellingPrice) * 100;

  return {
    id: `margin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    costPrice,
    desiredMarginPercent,
    gstRate,
    businessType,
    sellingPriceBeforeGST,
    gstAmount,
    finalSellingPrice,
    profitAmount,
    effectiveMarginPercent,
    timestamp: new Date()
  };
}

/**
 * Reverse calculation: given selling price, calculate actual margin
 */
export function calculateActualMargin(
  costPrice: number,
  sellingPrice: number,
  gstRate: number,
  includesGST: boolean = true
): {
  actualMarginPercent: number;
  profitAmount: number;
  sellingPriceBeforeGST: number;
  gstAmount: number;
} {
  if (costPrice <= 0) throw new Error('Cost price must be greater than 0');
  if (sellingPrice <= 0) throw new Error('Selling price must be greater than 0');

  let sellingPriceBeforeGST: number;
  let gstAmount: number;

  if (includesGST) {
    // Remove GST from selling price
    sellingPriceBeforeGST = sellingPrice / (1 + gstRate / 100);
    gstAmount = sellingPrice - sellingPriceBeforeGST;
  } else {
    sellingPriceBeforeGST = sellingPrice;
    gstAmount = (sellingPrice * gstRate) / 100;
  }

  const profitAmount = sellingPriceBeforeGST - costPrice;
  const actualMarginPercent = (profitAmount / sellingPriceBeforeGST) * 100;

  return {
    actualMarginPercent,
    profitAmount,
    sellingPriceBeforeGST,
    gstAmount
  };
}

/**
 * Calculate break-even price (minimum selling price to cover costs)
 */
export function calculateBreakEvenPrice(
  costPrice: number,
  gstRate: number,
  includeGST: boolean = true
): {
  breakEvenPriceBeforeGST: number;
  breakEvenPriceWithGST: number;
  gstAmount: number;
} {
  const breakEvenPriceBeforeGST = costPrice;
  const gstAmount = (breakEvenPriceBeforeGST * gstRate) / 100;
  const breakEvenPriceWithGST = breakEvenPriceBeforeGST + gstAmount;

  return {
    breakEvenPriceBeforeGST,
    breakEvenPriceWithGST,
    gstAmount
  };
}

/**
 * Compare multiple margin scenarios
 */
export function compareMarginScenarios(
  costPrice: number,
  marginPercentages: number[],
  gstRate: number,
  businessType: 'B2B' | 'B2C' = 'B2C'
): MarginComparison {
  const scenarios = marginPercentages.map(margin => 
    calculateProfitMargin(costPrice, margin, gstRate, businessType)
  );

  // Find best scenario (highest effective margin that's still reasonable)
  const bestScenario = scenarios.reduce((best, current) => {
    if (!best) return current;
    
    // Prefer higher effective margin but not unreasonably high
    if (current.effectiveMarginPercent > best.effectiveMarginPercent && 
        current.effectiveMarginPercent <= 50) {
      return current;
    }
    return best;
  });

  // Generate recommendations
  const recommendations: string[] = [];
  
  const avgMargin = scenarios.reduce((sum, s) => sum + s.effectiveMarginPercent, 0) / scenarios.length;
  
  if (avgMargin < 15) {
    recommendations.push('Consider increasing margins - current levels may not be sustainable');
  } else if (avgMargin > 50) {
    recommendations.push('High margins may affect competitiveness - consider market positioning');
  } else {
    recommendations.push('Margin levels appear healthy for sustainable business');
  }

  if (businessType === 'B2B' && avgMargin > 30) {
    recommendations.push('B2B margins seem high - ensure value proposition justifies pricing');
  }

  if (businessType === 'B2C' && avgMargin < 20) {
    recommendations.push('B2C margins may be too low - consider value-added services');
  }

  return {
    scenarios,
    bestScenario,
    recommendations
  };
}

/**
 * Get pricing strategy recommendation based on margin and business type
 */
export function getPricingStrategyRecommendation(
  marginPercent: number,
  businessType: 'B2B' | 'B2C'
): PricingStrategy | null {
  return PRICING_STRATEGIES.find(strategy => {
    const { min, max } = strategy.recommendedMargin;
    return marginPercent >= min && marginPercent <= max;
  }) || null;
}

/**
 * Calculate volume-based pricing scenarios
 */
export function calculateVolumeBasedPricing(
  costPrice: number,
  baseMarginPercent: number,
  gstRate: number,
  volumes: number[]
): Array<{
  volume: number;
  adjustedMargin: number;
  unitPrice: number;
  totalRevenue: number;
  totalProfit: number;
}> {
  return volumes.map(volume => {
    // Reduce margin for higher volumes (volume discount)
    let adjustedMargin = baseMarginPercent;
    
    if (volume >= 1000) adjustedMargin *= 0.8; // 20% margin reduction
    else if (volume >= 500) adjustedMargin *= 0.85; // 15% margin reduction
    else if (volume >= 100) adjustedMargin *= 0.9; // 10% margin reduction
    else if (volume >= 50) adjustedMargin *= 0.95; // 5% margin reduction

    const calculation = calculateProfitMargin(costPrice, adjustedMargin, gstRate);
    
    return {
      volume,
      adjustedMargin,
      unitPrice: calculation.finalSellingPrice,
      totalRevenue: calculation.finalSellingPrice * volume,
      totalProfit: calculation.profitAmount * volume
    };
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(percent: number): string {
  return `${percent.toFixed(2)}%`;
}
