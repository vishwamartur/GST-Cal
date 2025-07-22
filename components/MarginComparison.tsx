import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { BarChart3, Plus, X, TrendingUp, Award } from 'lucide-react-native';
import {
  compareMarginScenarios,
  formatCurrency,
  formatPercentage,
  ProfitMarginCalculation,
  MarginComparison as MarginComparisonType,
} from '../utils/profitMarginCalculations';

interface MarginComparisonProps {
  initialCostPrice?: number;
  initialGSTRate?: number;
  initialBusinessType?: 'B2B' | 'B2C';
}

interface ScenarioInput {
  id: string;
  marginPercent: string;
  label: string;
}

export default function MarginComparison({
  initialCostPrice = 0,
  initialGSTRate = 18,
  initialBusinessType = 'B2C',
}: MarginComparisonProps) {
  const [costPrice, setCostPrice] = useState(initialCostPrice.toString());
  const [gstRate, setGSTRate] = useState(initialGSTRate.toString());
  const [businessType, setBusinessType] = useState<'B2B' | 'B2C'>(initialBusinessType);
  
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([
    { id: '1', marginPercent: '20', label: 'Conservative' },
    { id: '2', marginPercent: '30', label: 'Standard' },
    { id: '3', marginPercent: '40', label: 'Premium' },
  ]);
  
  const [comparison, setComparison] = useState<MarginComparisonType | null>(null);
  const [loading, setLoading] = useState(false);

  const addScenario = () => {
    if (scenarios.length >= 6) {
      Alert.alert('Limit Reached', 'You can compare up to 6 scenarios at once');
      return;
    }

    const newScenario: ScenarioInput = {
      id: Date.now().toString(),
      marginPercent: '',
      label: `Scenario ${scenarios.length + 1}`,
    };

    setScenarios([...scenarios, newScenario]);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length <= 2) {
      Alert.alert('Minimum Required', 'You need at least 2 scenarios to compare');
      return;
    }

    setScenarios(scenarios.filter(scenario => scenario.id !== id));
  };

  const updateScenario = (id: string, field: 'marginPercent' | 'label', value: string) => {
    setScenarios(scenarios.map(scenario => 
      scenario.id === id ? { ...scenario, [field]: value } : scenario
    ));
  };

  const handleCompare = async () => {
    try {
      setLoading(true);

      const cost = parseFloat(costPrice);
      const gst = parseFloat(gstRate);

      if (isNaN(cost) || cost <= 0) {
        Alert.alert('Invalid Input', 'Please enter a valid cost price');
        return;
      }

      if (isNaN(gst) || gst < 0) {
        Alert.alert('Invalid Input', 'Please enter a valid GST rate');
        return;
      }

      // Validate and collect margin percentages
      const marginPercentages: number[] = [];
      for (const scenario of scenarios) {
        const margin = parseFloat(scenario.marginPercent);
        if (isNaN(margin) || margin < 0) {
          Alert.alert('Invalid Input', `Please enter a valid margin for ${scenario.label}`);
          return;
        }
        marginPercentages.push(margin);
      }

      const comparisonResult = compareMarginScenarios(cost, marginPercentages, gst, businessType);
      
      // Add labels to scenarios
      comparisonResult.scenarios = comparisonResult.scenarios.map((calc, index) => ({
        ...calc,
        description: scenarios[index].label,
      }));

      setComparison(comparisonResult);
    } catch (error) {
      Alert.alert('Calculation Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getBestScenarioIndex = (): number => {
    if (!comparison || !comparison.bestScenario) return -1;
    return comparison.scenarios.findIndex(s => s.id === comparison.bestScenario?.id);
  };

  const getScenarioColor = (index: number): string => {
    const colors = ['#1A237E', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
    return colors[index % colors.length];
  };

  const bestScenarioIndex = getBestScenarioIndex();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <BarChart3 size={24} color="#1A237E" />
        <Text style={styles.headerTitle}>Margin Comparison</Text>
      </View>

      {/* Base Inputs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Base Parameters</Text>
        
        <View style={styles.inputRow}>
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
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GST Rate (%)</Text>
            <TextInput
              style={styles.input}
              value={gstRate}
              onChangeText={setGSTRate}
              placeholder="GST rate"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Business Type */}
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

      {/* Scenarios */}
      <View style={styles.section}>
        <View style={styles.scenariosHeader}>
          <Text style={styles.sectionTitle}>Margin Scenarios</Text>
          <TouchableOpacity style={styles.addButton} onPress={addScenario}>
            <Plus size={16} color="#1A237E" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {scenarios.map((scenario, index) => (
          <View key={scenario.id} style={styles.scenarioRow}>
            <View style={[styles.scenarioIndicator, { backgroundColor: getScenarioColor(index) }]} />
            
            <View style={styles.scenarioInputs}>
              <TextInput
                style={styles.scenarioLabelInput}
                value={scenario.label}
                onChangeText={(value) => updateScenario(scenario.id, 'label', value)}
                placeholder="Scenario name"
              />
              
              <View style={styles.marginInputContainer}>
                <TextInput
                  style={styles.marginInput}
                  value={scenario.marginPercent}
                  onChangeText={(value) => updateScenario(scenario.id, 'marginPercent', value)}
                  placeholder="Margin %"
                  keyboardType="numeric"
                />
                <Text style={styles.percentSymbol}>%</Text>
              </View>
            </View>

            {scenarios.length > 2 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeScenario(scenario.id)}
              >
                <X size={16} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Compare Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.compareButton, loading && styles.compareButtonDisabled]}
          onPress={handleCompare}
          disabled={loading}
        >
          <BarChart3 size={20} color="#FFFFFF" />
          <Text style={styles.compareButtonText}>
            {loading ? 'Comparing...' : 'Compare Scenarios'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comparison Results */}
      {comparison && (
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <TrendingUp size={20} color="#4CAF50" />
            <Text style={styles.resultsTitle}>Comparison Results</Text>
          </View>

          {/* Scenarios Grid */}
          <View style={styles.scenariosGrid}>
            {comparison.scenarios.map((calc, index) => (
              <View
                key={calc.id}
                style={[
                  styles.scenarioCard,
                  index === bestScenarioIndex && styles.bestScenarioCard,
                ]}
              >
                {index === bestScenarioIndex && (
                  <View style={styles.bestBadge}>
                    <Award size={12} color="#FFD700" />
                    <Text style={styles.bestBadgeText}>Best</Text>
                  </View>
                )}

                <View style={[styles.scenarioHeader, { backgroundColor: getScenarioColor(index) }]}>
                  <Text style={styles.scenarioTitle}>{calc.description}</Text>
                  <Text style={styles.scenarioMargin}>
                    {formatPercentage(calc.desiredMarginPercent)}
                  </Text>
                </View>

                <View style={styles.scenarioDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Selling Price:</Text>
                    <Text style={styles.detailValue}>
                      {formatCurrency(calc.finalSellingPrice)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Profit:</Text>
                    <Text style={[styles.detailValue, styles.profitValue]}>
                      {formatCurrency(calc.profitAmount)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Effective Margin:</Text>
                    <Text style={[styles.detailValue, styles.marginValue]}>
                      {formatPercentage(calc.effectiveMarginPercent)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Recommendations */}
          {comparison.recommendations.length > 0 && (
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
              {comparison.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationRow}>
                  <View style={styles.recommendationBullet} />
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Summary Statistics */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price Range:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(Math.min(...comparison.scenarios.map(s => s.finalSellingPrice)))} - {formatCurrency(Math.max(...comparison.scenarios.map(s => s.finalSellingPrice)))}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Profit Range:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(Math.min(...comparison.scenarios.map(s => s.profitAmount)))} - {formatCurrency(Math.max(...comparison.scenarios.map(s => s.profitAmount)))}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average Margin:</Text>
              <Text style={styles.summaryValue}>
                {formatPercentage(comparison.scenarios.reduce((sum, s) => sum + s.effectiveMarginPercent, 0) / comparison.scenarios.length)}
              </Text>
            </View>
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
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
    marginLeft: 8,
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
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
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
  scenariosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1A237E',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A237E',
    marginLeft: 4,
  },
  scenarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  scenarioIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  scenarioInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scenarioLabelInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  marginInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingRight: 8,
  },
  marginInput: {
    padding: 8,
    fontSize: 14,
    minWidth: 60,
    textAlign: 'center',
  },
  percentSymbol: {
    fontSize: 14,
    color: '#666666',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  compareButton: {
    backgroundColor: '#1A237E',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  compareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  scenariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scenarioCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  bestScenarioCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  bestBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 2,
  },
  scenarioHeader: {
    padding: 12,
    alignItems: 'center',
  },
  scenarioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scenarioMargin: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  scenarioDetails: {
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666666',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  profitValue: {
    color: '#4CAF50',
  },
  marginValue: {
    color: '#1A237E',
  },
  recommendationsCard: {
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1A237E',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 12,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1A237E',
    marginTop: 6,
    marginRight: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
});
