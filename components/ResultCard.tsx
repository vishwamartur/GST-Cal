import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { formatCurrency } from '@/utils/currency';
import { Receipt, TrendingUp, Percent, DollarSign } from 'lucide-react-native';

interface ResultProps {
  result: {
    description: string;
    amount: number;
    isInclusive: boolean;
    gstRate: number;
    netAmount: number;
    gstAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    grossAmount: number;
    currency?: string;
  };
}

function AnimatedNumber({ value, currency, delay = 0, style }: { value: number; currency: string; delay?: number; style?: any }) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, [value]);

  return (
    <Animated.Text style={style}>
      {formatCurrency(value, currency)}
    </Animated.Text>
  );
}

export default function ResultCard({ result }: ResultProps) {
  const currency = result.currency || 'INR';

  const formatAmount = (value: number) => {
    return formatCurrency(value, currency);
  };

  // Calculate progress for visual bars
  const gstPercentage = (result.gstAmount / result.grossAmount) * 100;
  const netPercentage = (result.netAmount / result.grossAmount) * 100;

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      {/* Gradient Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#A855F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Receipt size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Calculation Result</Text>
            <Text style={styles.description} numberOfLines={1}>{result.description}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {result.isInclusive ? 'Inclusive' : 'Exclusive'} @ {result.gstRate}%
          </Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Net Amount */}
        <Animated.View
          entering={SlideInRight.delay(100).duration(400)}
          style={styles.amountRow}
        >
          <View style={styles.amountLeft}>
            <View style={[styles.iconBadge, { backgroundColor: '#E0F2FE' }]}>
              <DollarSign size={16} color="#0EA5E9" />
            </View>
            <Text style={styles.amountLabel}>Net Amount</Text>
          </View>
          <Text style={styles.amountValue}>{formatAmount(result.netAmount)}</Text>
        </Animated.View>

        {/* Visual Progress Bar */}
        <Animated.View
          entering={SlideInRight.delay(150).duration(400)}
          style={styles.progressContainer}
        >
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, styles.netFill, { width: `${netPercentage}%` }]} />
            <View style={[styles.progressFill, styles.gstFill, { width: `${gstPercentage}%` }]} />
          </View>
          <View style={styles.progressLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#14B8A6' }]} />
              <Text style={styles.legendText}>Net ({netPercentage.toFixed(1)}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.legendText}>GST ({gstPercentage.toFixed(1)}%)</Text>
            </View>
          </View>
        </Animated.View>

        {/* GST Breakdown Section */}
        <Animated.View
          entering={SlideInRight.delay(200).duration(400)}
          style={styles.gstSection}
        >
          <View style={styles.gstHeader}>
            <Percent size={16} color="#8B5CF6" />
            <Text style={styles.gstTitle}>GST Breakdown</Text>
          </View>

          <View style={styles.gstGrid}>
            <View style={styles.gstItem}>
              <Text style={styles.gstItemLabel}>CGST ({result.gstRate / 2}%)</Text>
              <Text style={styles.gstItemValue}>{formatAmount(result.cgstAmount)}</Text>
            </View>
            <View style={styles.gstDivider} />
            <View style={styles.gstItem}>
              <Text style={styles.gstItemLabel}>SGST ({result.gstRate / 2}%)</Text>
              <Text style={styles.gstItemValue}>{formatAmount(result.sgstAmount)}</Text>
            </View>
          </View>

          <View style={styles.totalGstRow}>
            <Text style={styles.totalGstLabel}>Total GST</Text>
            <Text style={styles.totalGstValue}>{formatAmount(result.gstAmount)}</Text>
          </View>
        </Animated.View>

        {/* Gross Amount - Hero */}
        <Animated.View
          entering={SlideInRight.delay(300).duration(400)}
          style={styles.grossContainer}
        >
          <LinearGradient
            colors={['#F0FDF4', '#DCFCE7']}
            style={styles.grossGradient}
          >
            <View style={styles.grossLeft}>
              <View style={[styles.iconBadge, { backgroundColor: '#14B8A6' }]}>
                <TrendingUp size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.grossLabel}>Gross Amount</Text>
                <Text style={styles.grossSubtitle}>Final payable amount</Text>
              </View>
            </View>
            <Text style={styles.grossValue}>{formatAmount(result.grossAmount)}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Info Footer */}
        <Animated.View
          entering={FadeIn.delay(400).duration(400)}
          style={styles.infoFooter}
        >
          <Text style={styles.infoText}>
            {result.isInclusive
              ? `You entered ₹${result.amount.toLocaleString()} including GST`
              : `You entered ₹${result.amount.toLocaleString()} excluding GST`}
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  amountLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 17,
    color: '#1E293B',
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  netFill: {
    backgroundColor: '#14B8A6',
  },
  gstFill: {
    backgroundColor: '#8B5CF6',
  },
  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  gstSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  gstHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  gstTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 8,
  },
  gstGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gstItem: {
    flex: 1,
  },
  gstDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  gstItemLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  gstItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalGstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalGstLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  totalGstValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  grossContainer: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  grossGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  grossLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grossLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#047857',
  },
  grossSubtitle: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
  grossValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#047857',
  },
  infoFooter: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
});