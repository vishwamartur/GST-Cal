import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calculator, BarChart3, History, Settings, TrendingUp } from 'lucide-react-native';
import ProfitMarginCalculator from '../../components/ProfitMarginCalculator';
import MarginComparison from '../../components/MarginComparison';
import {
  ProfitMarginCalculation,
  formatCurrency,
  formatPercentage,
} from '../../utils/profitMarginCalculations';
import {
  getMarginCalculations,
  getMarginStatistics,
  getMarginSettings,
} from '../../utils/profitMarginStorage';

type ViewMode = 'calculator' | 'comparison' | 'history' | 'settings';

export default function ProfitMarginScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('calculator');
  const [recentCalculations, setRecentCalculations] = useState<ProfitMarginCalculation[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [calculations, stats, settings] = await Promise.all([
        getMarginCalculations(),
        getMarginStatistics(),
        getMarginSettings(),
      ]);

      setRecentCalculations(calculations.slice(0, 5)); // Show last 5
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading profit margin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCalculationSave = (calculation: ProfitMarginCalculation) => {
    setRecentCalculations(prev => [calculation, ...prev.slice(0, 4)]);
    loadData(); // Refresh statistics
  };

  const renderViewModeToggle = () => (
    <View style={styles.viewToggle}>
      <TouchableOpacity
        style={[styles.toggleButton, viewMode === 'calculator' && styles.activeToggle]}
        onPress={() => setViewMode('calculator')}
      >
        <Calculator size={16} color={viewMode === 'calculator' ? '#FFFFFF' : '#1A237E'} />
        <Text style={[styles.toggleText, viewMode === 'calculator' && styles.activeToggleText]}>
          Calculator
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.toggleButton, viewMode === 'comparison' && styles.activeToggle]}
        onPress={() => setViewMode('comparison')}
      >
        <BarChart3 size={16} color={viewMode === 'comparison' ? '#FFFFFF' : '#1A237E'} />
        <Text style={[styles.toggleText, viewMode === 'comparison' && styles.activeToggleText]}>
          Compare
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.toggleButton, viewMode === 'history' && styles.activeToggle]}
        onPress={() => setViewMode('history')}
      >
        <History size={16} color={viewMode === 'history' ? '#FFFFFF' : '#1A237E'} />
        <Text style={[styles.toggleText, viewMode === 'history' && styles.activeToggleText]}>
          History
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatisticsCard = () => {
    if (!statistics || statistics.totalCalculations === 0) return null;

    return (
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <TrendingUp size={16} color="#4CAF50" />
          <Text style={styles.statsTitle}>Quick Stats</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.totalCalculations}</Text>
            <Text style={styles.statLabel}>Calculations</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatPercentage(statistics.averageMargin)}
            </Text>
            <Text style={styles.statLabel}>Avg Margin</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(statistics.averageSellingPrice)}
            </Text>
            <Text style={styles.statLabel}>Avg Price</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.mostUsedBusinessType}</Text>
            <Text style={styles.statLabel}>Primary Type</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRecentCalculations = () => {
    if (recentCalculations.length === 0) return null;

    return (
      <View style={styles.recentCard}>
        <Text style={styles.recentTitle}>Recent Calculations</Text>
        {recentCalculations.map((calc) => (
          <View key={calc.id} style={styles.recentItem}>
            <View style={styles.recentInfo}>
              <Text style={styles.recentDescription}>
                {calc.description || `${calc.businessType} Calculation`}
              </Text>
              <Text style={styles.recentDetails}>
                Cost: {formatCurrency(calc.costPrice)} • Margin: {formatPercentage(calc.desiredMarginPercent)}
              </Text>
            </View>
            <View style={styles.recentResults}>
              <Text style={styles.recentPrice}>
                {formatCurrency(calc.finalSellingPrice)}
              </Text>
              <Text style={styles.recentProfit}>
                +{formatCurrency(calc.profitAmount)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderHistoryView = () => (
    <ScrollView
      style={styles.historyContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {renderStatisticsCard()}
      {renderRecentCalculations()}
      
      {recentCalculations.length === 0 && (
        <View style={styles.emptyState}>
          <Calculator size={48} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No calculations yet</Text>
          <Text style={styles.emptySubtitle}>
            Start by calculating your first profit margin
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'calculator':
        return (
          <ProfitMarginCalculator
            onCalculationSave={handleCalculationSave}
          />
        );
      
      case 'comparison':
        return <MarginComparison />;
      
      case 'history':
        return renderHistoryView();
      
      default:
        return (
          <ProfitMarginCalculator
            onCalculationSave={handleCalculationSave}
          />
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profit margin calculator...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with View Toggle */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profit Margin Calculator</Text>
        {renderViewModeToggle()}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#1A237E',
  },
  toggleText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A237E',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  historyContainer: {
    flex: 1,
  },
  statsCard: {
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
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A237E',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recentInfo: {
    flex: 1,
  },
  recentDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  recentDetails: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  recentResults: {
    alignItems: 'flex-end',
  },
  recentPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A237E',
  },
  recentProfit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
});
