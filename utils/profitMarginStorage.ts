import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfitMarginCalculation, MarginPreset, DEFAULT_MARGIN_PRESETS } from './profitMarginCalculations';
import { Calculation, saveCalculation } from './storage';

export interface ProfitMarginSettings {
  defaultBusinessType: 'B2B' | 'B2C';
  defaultGSTRate: number;
  showBreakdownByDefault: boolean;
  autoSaveCalculations: boolean;
  preferredCurrency: string;
  volumeDiscountEnabled: boolean;
}

const STORAGE_KEYS = {
  MARGIN_CALCULATIONS: 'profit_margin_calculations',
  MARGIN_PRESETS: 'profit_margin_presets',
  MARGIN_SETTINGS: 'profit_margin_settings',
};

// Default settings
const DEFAULT_MARGIN_SETTINGS: ProfitMarginSettings = {
  defaultBusinessType: 'B2C',
  defaultGSTRate: 18,
  showBreakdownByDefault: true,
  autoSaveCalculations: true,
  preferredCurrency: '₹',
  volumeDiscountEnabled: false,
};

// Margin Calculations History
export async function getMarginCalculations(): Promise<ProfitMarginCalculation[]> {
  try {
    const calculations = await AsyncStorage.getItem(STORAGE_KEYS.MARGIN_CALCULATIONS);
    return calculations ? JSON.parse(calculations) : [];
  } catch (error) {
    console.error('Error getting margin calculations:', error);
    return [];
  }
}

export async function saveMarginCalculation(calculation: ProfitMarginCalculation): Promise<void> {
  try {
    const calculations = await getMarginCalculations();
    calculations.unshift(calculation); // Add to beginning

    // Keep only last 100 calculations
    if (calculations.length > 100) {
      calculations.splice(100);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.MARGIN_CALCULATIONS, JSON.stringify(calculations));

    // Also save to main calculation history for unified view
    const settings = await getMarginSettings();
    if (settings.autoSaveCalculations) {
      await saveToMainHistory(calculation);
    }
  } catch (error) {
    console.error('Error saving margin calculation:', error);
    throw error;
  }
}

// Convert profit margin calculation to main history format
async function saveToMainHistory(calculation: ProfitMarginCalculation): Promise<void> {
  try {
    const historyItem: Calculation = {
      timestamp: calculation.timestamp.toISOString(),
      description: `${calculation.description || 'Profit Margin'} (${calculation.businessType})`,
      amount: calculation.costPrice,
      isInclusive: false, // Cost price is always exclusive
      gstRate: calculation.gstRate,
      netAmount: calculation.sellingPriceBeforeGST,
      gstAmount: calculation.gstAmount,
      cgstAmount: calculation.gstAmount / 2, // Split GST equally
      sgstAmount: calculation.gstAmount / 2,
      grossAmount: calculation.finalSellingPrice,
      currency: '₹',
    };

    await saveCalculation(historyItem);
  } catch (error) {
    console.error('Error saving to main history:', error);
    // Don't throw error as this is optional integration
  }
}

export async function deleteMarginCalculation(calculationId: string): Promise<void> {
  try {
    const calculations = await getMarginCalculations();
    const filteredCalculations = calculations.filter(calc => calc.id !== calculationId);
    await AsyncStorage.setItem(STORAGE_KEYS.MARGIN_CALCULATIONS, JSON.stringify(filteredCalculations));
  } catch (error) {
    console.error('Error deleting margin calculation:', error);
    throw error;
  }
}

export async function clearMarginCalculations(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.MARGIN_CALCULATIONS);
  } catch (error) {
    console.error('Error clearing margin calculations:', error);
    throw error;
  }
}

// Margin Presets
export async function getMarginPresets(): Promise<MarginPreset[]> {
  try {
    const presets = await AsyncStorage.getItem(STORAGE_KEYS.MARGIN_PRESETS);
    if (presets) {
      return JSON.parse(presets);
    } else {
      // Initialize with default presets
      await saveMarginPresets(DEFAULT_MARGIN_PRESETS);
      return DEFAULT_MARGIN_PRESETS;
    }
  } catch (error) {
    console.error('Error getting margin presets:', error);
    return DEFAULT_MARGIN_PRESETS;
  }
}

export async function saveMarginPresets(presets: MarginPreset[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MARGIN_PRESETS, JSON.stringify(presets));
  } catch (error) {
    console.error('Error saving margin presets:', error);
    throw error;
  }
}

export async function addMarginPreset(preset: MarginPreset): Promise<void> {
  try {
    const presets = await getMarginPresets();
    
    // Check if preset with same name already exists
    const existingIndex = presets.findIndex(p => p.name === preset.name);
    if (existingIndex >= 0) {
      presets[existingIndex] = preset; // Update existing
    } else {
      presets.push(preset); // Add new
    }
    
    await saveMarginPresets(presets);
  } catch (error) {
    console.error('Error adding margin preset:', error);
    throw error;
  }
}

export async function deleteMarginPreset(presetId: string): Promise<void> {
  try {
    const presets = await getMarginPresets();
    const filteredPresets = presets.filter(preset => preset.id !== presetId);
    await saveMarginPresets(filteredPresets);
  } catch (error) {
    console.error('Error deleting margin preset:', error);
    throw error;
  }
}

export async function getDefaultMarginPresets(businessType?: 'B2B' | 'B2C'): Promise<MarginPreset[]> {
  try {
    const presets = await getMarginPresets();
    const defaultPresets = presets.filter(preset => preset.isDefault);
    
    if (businessType) {
      return defaultPresets.filter(preset => preset.businessType === businessType);
    }
    
    return defaultPresets;
  } catch (error) {
    console.error('Error getting default margin presets:', error);
    return [];
  }
}

// Settings
export async function getMarginSettings(): Promise<ProfitMarginSettings> {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.MARGIN_SETTINGS);
    return settings ? JSON.parse(settings) : DEFAULT_MARGIN_SETTINGS;
  } catch (error) {
    console.error('Error getting margin settings:', error);
    return DEFAULT_MARGIN_SETTINGS;
  }
}

export async function saveMarginSettings(settings: ProfitMarginSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MARGIN_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving margin settings:', error);
    throw error;
  }
}

// Search and Filter Functions
export async function searchMarginCalculations(query: string): Promise<ProfitMarginCalculation[]> {
  try {
    const calculations = await getMarginCalculations();
    const lowerQuery = query.toLowerCase();
    
    return calculations.filter(calc => 
      calc.description?.toLowerCase().includes(lowerQuery) ||
      calc.businessType.toLowerCase().includes(lowerQuery) ||
      calc.costPrice.toString().includes(query) ||
      calc.desiredMarginPercent.toString().includes(query)
    );
  } catch (error) {
    console.error('Error searching margin calculations:', error);
    return [];
  }
}

export async function getMarginCalculationsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<ProfitMarginCalculation[]> {
  try {
    const calculations = await getMarginCalculations();
    
    return calculations.filter(calc => {
      const calcDate = new Date(calc.timestamp);
      return calcDate >= startDate && calcDate <= endDate;
    });
  } catch (error) {
    console.error('Error getting calculations by date range:', error);
    return [];
  }
}

export async function getMarginCalculationsByBusinessType(
  businessType: 'B2B' | 'B2C'
): Promise<ProfitMarginCalculation[]> {
  try {
    const calculations = await getMarginCalculations();
    return calculations.filter(calc => calc.businessType === businessType);
  } catch (error) {
    console.error('Error getting calculations by business type:', error);
    return [];
  }
}

// Statistics and Analytics
export async function getMarginStatistics(): Promise<{
  totalCalculations: number;
  averageMargin: number;
  mostUsedBusinessType: 'B2B' | 'B2C';
  averageCostPrice: number;
  averageSellingPrice: number;
  marginDistribution: { range: string; count: number }[];
}> {
  try {
    const calculations = await getMarginCalculations();
    
    if (calculations.length === 0) {
      return {
        totalCalculations: 0,
        averageMargin: 0,
        mostUsedBusinessType: 'B2C',
        averageCostPrice: 0,
        averageSellingPrice: 0,
        marginDistribution: []
      };
    }

    const totalCalculations = calculations.length;
    const averageMargin = calculations.reduce((sum, calc) => sum + calc.effectiveMarginPercent, 0) / totalCalculations;
    
    const businessTypeCounts = calculations.reduce((counts, calc) => {
      counts[calc.businessType] = (counts[calc.businessType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const mostUsedBusinessType = businessTypeCounts['B2B'] > businessTypeCounts['B2C'] ? 'B2B' : 'B2C';
    
    const averageCostPrice = calculations.reduce((sum, calc) => sum + calc.costPrice, 0) / totalCalculations;
    const averageSellingPrice = calculations.reduce((sum, calc) => sum + calc.finalSellingPrice, 0) / totalCalculations;
    
    // Margin distribution
    const marginRanges = [
      { range: '0-10%', min: 0, max: 10 },
      { range: '10-20%', min: 10, max: 20 },
      { range: '20-30%', min: 20, max: 30 },
      { range: '30-40%', min: 30, max: 40 },
      { range: '40%+', min: 40, max: Infinity }
    ];
    
    const marginDistribution = marginRanges.map(range => ({
      range: range.range,
      count: calculations.filter(calc => 
        calc.effectiveMarginPercent >= range.min && calc.effectiveMarginPercent < range.max
      ).length
    }));

    return {
      totalCalculations,
      averageMargin,
      mostUsedBusinessType,
      averageCostPrice,
      averageSellingPrice,
      marginDistribution
    };
  } catch (error) {
    console.error('Error getting margin statistics:', error);
    throw error;
  }
}

// Export Functions
export async function exportMarginCalculations(format: 'json' | 'csv' = 'json'): Promise<string> {
  try {
    const calculations = await getMarginCalculations();
    
    if (format === 'csv') {
      const headers = [
        'Date',
        'Description',
        'Business Type',
        'Cost Price',
        'Desired Margin %',
        'GST Rate %',
        'Selling Price (Before GST)',
        'GST Amount',
        'Final Selling Price',
        'Profit Amount',
        'Effective Margin %'
      ];
      
      const csvRows = calculations.map(calc => [
        new Date(calc.timestamp).toLocaleDateString('en-IN'),
        calc.description || '',
        calc.businessType,
        calc.costPrice.toFixed(2),
        calc.desiredMarginPercent.toFixed(2),
        calc.gstRate.toFixed(2),
        calc.sellingPriceBeforeGST.toFixed(2),
        calc.gstAmount.toFixed(2),
        calc.finalSellingPrice.toFixed(2),
        calc.profitAmount.toFixed(2),
        calc.effectiveMarginPercent.toFixed(2)
      ]);
      
      return [headers, ...csvRows].map(row => row.join(',')).join('\n');
    } else {
      return JSON.stringify(calculations, null, 2);
    }
  } catch (error) {
    console.error('Error exporting margin calculations:', error);
    throw error;
  }
}

// Utility Functions
export async function clearAllMarginData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.MARGIN_CALCULATIONS,
      STORAGE_KEYS.MARGIN_PRESETS,
      STORAGE_KEYS.MARGIN_SETTINGS,
    ]);
  } catch (error) {
    console.error('Error clearing all margin data:', error);
    throw error;
  }
}
