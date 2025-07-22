import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Calculator, Info, Save, RotateCcw, TrendingUp, DollarSign } from 'lucide-react-native';
import {
  calculateProfitMargin,
  calculateActualMargin,
  calculateBreakEvenPrice,
  formatCurrency,
  formatPercentage,
  ProfitMarginCalculation,
  MarginPreset,
  getPricingStrategyRecommendation,
} from '../utils/profitMarginCalculations';
import {
  getMarginSettings,
  getMarginPresets,
  saveMarginCalculation,
  addMarginPreset,
} from '../utils/profitMarginStorage';
import { getPreferences } from '../utils/storage';

interface ProfitMarginCalculatorProps {
  onCalculationSave?: (calculation: ProfitMarginCalculation) => void;
  initialValues?: {
    costPrice?: number;
    marginPercent?: number;
    gstRate?: number;
    businessType?: 'B2B' | 'B2C';
  };
}

export default function ProfitMarginCalculator({
  onCalculationSave,
  initialValues,
}: ProfitMarginCalculatorProps) {
  // Input states
  const [costPrice, setCostPrice] = useState(initialValues?.costPrice?.toString() || '');
  const [marginPercent, setMarginPercent] = useState(initialValues?.marginPercent?.toString() || '');
  const [gstRate, setGSTRate] = useState(initialValues?.gstRate?.toString() || '18');
  const [businessType, setBusinessType] = useState<'B2B' | 'B2C'>(initialValues?.businessType || 'B2C');
  const [description, setDescription] = useState('');

  // Calculation states
  const [calculation, setCalculation] = useState<ProfitMarginCalculation | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [reverseMode, setReverseMode] = useState(false);
  const [sellingPrice, setSellingPrice] = useState('');

  // Presets and settings
  const [marginPresets, setMarginPresets] = useState<MarginPreset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [settings, presets, preferences] = await Promise.all([
        getMarginSettings(),
        getMarginPresets(),
        getPreferences(),
      ]);

      setBusinessType(settings.defaultBusinessType);
      setGSTRate(settings.defaultGSTRate.toString());
      setShowBreakdown(settings.showBreakdownByDefault);
      setMarginPresets(presets);

      // Use default GST rate from main app preferences if available
      if (preferences?.defaultGSTRate) {
        setGSTRate(preferences.defaultGSTRate.toString());
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleCalculate = () => {
    try {
      const cost = parseFloat(costPrice);
      const margin = parseFloat(marginPercent);
      const gst = parseFloat(gstRate);

      if (isNaN(cost) || cost <= 0) {
        Alert.alert('Invalid Input', 'Please enter a valid cost price');
        return;
      }

      if (reverseMode) {
        const selling = parseFloat(sellingPrice);
        if (isNaN(selling) || selling <= 0) {
          Alert.alert('Invalid Input', 'Please enter a valid selling price');
          return;
        }

        const reverseCalc = calculateActualMargin(cost, selling, gst, true);
        
        // Create a calculation object for display
        const calc: ProfitMarginCalculation = {
          id: `reverse_${Date.now()}`,
          costPrice: cost,
          desiredMarginPercent: reverseCalc.actualMarginPercent,
          gstRate: gst,
          businessType,
          sellingPriceBeforeGST: reverseCalc.sellingPriceBeforeGST,
          gstAmount: reverseCalc.gstAmount,
          finalSellingPrice: selling,
          profitAmount: reverseCalc.profitAmount,
          effectiveMarginPercent: reverseCalc.actualMarginPercent,
          timestamp: new Date(),
          description: description || 'Reverse calculation',
        };

        setCalculation(calc);
        setMarginPercent(reverseCalc.actualMarginPercent.toFixed(2));
      } else {
        if (isNaN(margin) || margin < 0) {
          Alert.alert('Invalid Input', 'Please enter a valid margin percentage');
          return;
        }

        const calc = calculateProfitMargin(cost, margin, gst, businessType);
        calc.description = description || `${businessType} pricing calculation`;
        
        setCalculation(calc);
      }
    } catch (error) {
      Alert.alert('Calculation Error', error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleSaveCalculation = async () => {
    if (!calculation) return;

    try {
      setLoading(true);
      await saveMarginCalculation(calculation);
      
      if (onCalculationSave) {
        onCalculationSave(calculation);
      }
      
      Alert.alert('Success', 'Calculation saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save calculation');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsPreset = async () => {
    if (!marginPercent) {
      Alert.alert('Invalid Input', 'Please enter a margin percentage first');
      return;
    }

    Alert.prompt(
      'Save Margin Preset',
      'Enter a name for this margin preset:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (name) => {
            if (!name?.trim()) return;
            
            try {
              const preset: MarginPreset = {
                id: `preset_${Date.now()}`,
                name: name.trim(),
                marginPercent: parseFloat(marginPercent),
                businessType,
                description: description || undefined,
              };

              await addMarginPreset(preset);
              const updatedPresets = await getMarginPresets();
              setMarginPresets(updatedPresets);
              
              Alert.alert('Success', 'Margin preset saved!');
            } catch (error) {
              Alert.alert('Error', 'Failed to save preset');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handlePresetSelect = (preset: MarginPreset) => {
    setMarginPercent(preset.marginPercent.toString());
    setBusinessType(preset.businessType);
    setDescription(preset.description || '');
  };

  const handleReset = () => {
    setCostPrice('');
    setMarginPercent('');
    setSellingPrice('');
    setDescription('');
    setCalculation(null);
  };

  const getBreakEvenInfo = () => {
    if (!costPrice) return null;
    
    const cost = parseFloat(costPrice);
    const gst = parseFloat(gstRate);
    
    if (isNaN(cost) || isNaN(gst)) return null;
    
    return calculateBreakEvenPrice(cost, gst);
  };

  const getPricingStrategy = () => {
    if (!calculation) return null;
    return getPricingStrategyRecommendation(calculation.effectiveMarginPercent, businessType);
  };

  const breakEvenInfo = getBreakEvenInfo();
  const pricingStrategy = getPricingStrategy();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Calculator size={24} color="#1A237E" />
          <Text style={styles.headerTitle}>Profit Margin Calculator</Text>
        </View>
        
        <View style={styles.modeToggle}>
          <Text style={styles.modeLabel}>Reverse Mode</Text>
          <Switch
            value={reverseMode}
            onValueChange={setReverseMode}
            trackColor={{ false: '#E0E0E0', true: '#C5CAE9' }}
            thumbColor={reverseMode ? '#1A237E' : '#BDBDBD'}
          />
        </View>
      </View>

      {/* Business Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Type</Text>
        <View style={styles.businessTypeContainer}>
          <TouchableOpacity
            style={[
              styles.businessTypeButton,
              businessType === 'B2B' && styles.businessTypeButtonActive,
            ]}
            onPress={() => setBusinessType('B2B')}
          >
            <Text
              style={[
                styles.businessTypeText,
                businessType === 'B2B' && styles.businessTypeTextActive,
              ]}
            >
              B2B
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.businessTypeButton,
              businessType === 'B2C' && styles.businessTypeButtonActive,
            ]}
            onPress={() => setBusinessType('B2C')}
          >
            <Text
              style={[
                styles.businessTypeText,
                businessType === 'B2C' && styles.businessTypeTextActive,
              ]}
            >
              B2C
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Input Fields */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {reverseMode ? 'Reverse Calculation' : 'Pricing Inputs'}
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cost Price (₹)</Text>
          <TextInput
            style={styles.input}
            value={costPrice}
            onChangeText={setCostPrice}
            placeholder="Enter cost price"
            keyboardType="numeric"
          />
        </View>

        {reverseMode ? (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Selling Price (₹)</Text>
            <TextInput
              style={styles.input}
              value={sellingPrice}
              onChangeText={setSellingPrice}
              placeholder="Enter selling price"
              keyboardType="numeric"
            />
          </View>
        ) : (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Desired Margin (%)</Text>
            <TextInput
              style={styles.input}
              value={marginPercent}
              onChangeText={setMarginPercent}
              placeholder="Enter margin percentage"
              keyboardType="numeric"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>GST Rate (%)</Text>
          <TextInput
            style={styles.input}
            value={gstRate}
            onChangeText={setGSTRate}
            placeholder="Enter GST rate"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
          />
        </View>
      </View>

      {/* Margin Presets */}
      {!reverseMode && marginPresets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Presets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.presetsContainer}>
              {marginPresets
                .filter(preset => preset.businessType === businessType)
                .slice(0, 5)
                .map((preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={styles.presetButton}
                    onPress={() => handlePresetSelect(preset)}
                  >
                    <Text style={styles.presetName}>{preset.name}</Text>
                    <Text style={styles.presetMargin}>{preset.marginPercent}%</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
          <Calculator size={20} color="#FFFFFF" />
          <Text style={styles.calculateButtonText}>Calculate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <RotateCcw size={20} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Break-even Information */}
      {breakEvenInfo && (
        <View style={styles.section}>
          <View style={styles.infoHeader}>
            <Info size={16} color="#FF9800" />
            <Text style={styles.infoTitle}>Break-even Price</Text>
          </View>
          <Text style={styles.infoText}>
            Minimum selling price: {formatCurrency(breakEvenInfo.breakEvenPriceWithGST)}
          </Text>
        </View>
      )}

      {/* Calculation Results */}
      {calculation && (
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <TrendingUp size={20} color="#4CAF50" />
            <Text style={styles.resultsTitle}>Calculation Results</Text>
          </View>

          {/* Main Results */}
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Final Selling Price:</Text>
              <Text style={styles.resultValue}>
                {formatCurrency(calculation.finalSellingPrice)}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Profit Amount:</Text>
              <Text style={[styles.resultValue, styles.profitValue]}>
                {formatCurrency(calculation.profitAmount)}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Effective Margin:</Text>
              <Text style={[styles.resultValue, styles.marginValue]}>
                {formatPercentage(calculation.effectiveMarginPercent)}
              </Text>
            </View>
          </View>

          {/* Detailed Breakdown */}
          {showBreakdown && (
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Price Breakdown</Text>
              
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Cost Price:</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(calculation.costPrice)}
                </Text>
              </View>
              
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>+ Profit ({formatPercentage(calculation.desiredMarginPercent)}):</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(calculation.profitAmount)}
                </Text>
              </View>
              
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>= Price Before GST:</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(calculation.sellingPriceBeforeGST)}
                </Text>
              </View>
              
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>+ GST ({formatPercentage(calculation.gstRate)}):</Text>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(calculation.gstAmount)}
                </Text>
              </View>
              
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Final Selling Price:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(calculation.finalSellingPrice)}
                </Text>
              </View>
            </View>
          )}

          {/* Pricing Strategy Recommendation */}
          {pricingStrategy && (
            <View style={styles.strategyCard}>
              <View style={styles.strategyHeader}>
                <DollarSign size={16} color="#1A237E" />
                <Text style={styles.strategyTitle}>Pricing Strategy</Text>
              </View>
              <Text style={styles.strategyName}>{pricingStrategy.name}</Text>
              <Text style={styles.strategyDescription}>{pricingStrategy.description}</Text>
            </View>
          )}

          {/* Save Actions */}
          <View style={styles.saveActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveCalculation}
              disabled={loading}
            >
              <Save size={16} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Calculation</Text>
            </TouchableOpacity>
            
            {!reverseMode && (
              <TouchableOpacity
                style={styles.presetSaveButton}
                onPress={handleSaveAsPreset}
              >
                <Text style={styles.presetSaveButtonText}>Save as Preset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
    marginLeft: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  businessTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  businessTypeButton: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  businessTypeButtonActive: {
    backgroundColor: '#1A237E',
    borderColor: '#1A237E',
  },
  businessTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  businessTypeTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  presetsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  presetButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  presetName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  presetMargin: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A237E',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: '#1A237E',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF9800',
    marginLeft: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
  },
  resultsSection: {
    margin: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  profitValue: {
    color: '#4CAF50',
  },
  marginValue: {
    color: '#1A237E',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666666',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A237E',
  },
  strategyCard: {
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1A237E',
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  strategyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A237E',
    marginLeft: 6,
  },
  strategyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  strategyDescription: {
    fontSize: 14,
    color: '#666666',
  },
  saveActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  presetSaveButton: {
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1A237E',
  },
  presetSaveButtonText: {
    color: '#1A237E',
    fontSize: 14,
    fontWeight: '500',
  },
});
