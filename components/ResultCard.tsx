import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { formatCurrency } from '@/utils/currency';

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

export default function ResultCard({ result }: ResultProps) {
  const formatAmount = (value: number) => {
    return formatCurrency(value, result.currency || 'INR');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculation Result</Text>
      <Text style={styles.description}>{result.description}</Text>
      <Text style={styles.subtitle}>
        {result.isInclusive ? 'GST Inclusive Calculation' : 'GST Exclusive Calculation'} ({result.gstRate}%)
      </Text>

      <View style={styles.resultRow}>
        <Animated.View
          entering={SlideInRight.delay(100).duration(500)}
          style={styles.resultItem}
        >
          <Text style={styles.resultLabel}>Net Amount</Text>
          <Text style={styles.resultValue}>{formatAmount(result.netAmount)}</Text>
        </Animated.View>
      </View>

      {/* GST Breakdown Section */}
      <Animated.View
        entering={SlideInRight.delay(200).duration(500)}
        style={styles.gstBreakdownSection}
      >
        <Text style={styles.gstBreakdownTitle}>GST Breakdown ({result.gstRate}%)</Text>

        <View style={styles.gstBreakdownContainer}>
          <View style={styles.gstComponentRow}>
            <Text style={styles.gstComponentLabel}>CGST ({result.gstRate / 2}%)</Text>
            <Text style={styles.gstComponentValue}>{formatAmount(result.cgstAmount)}</Text>
          </View>

          <View style={styles.gstComponentRow}>
            <Text style={styles.gstComponentLabel}>SGST ({result.gstRate / 2}%)</Text>
            <Text style={styles.gstComponentValue}>{formatAmount(result.sgstAmount)}</Text>
          </View>

          <View style={styles.gstTotalRow}>
            <Text style={styles.gstTotalLabel}>Total GST</Text>
            <Text style={styles.gstTotalValue}>{formatAmount(result.gstAmount)}</Text>
          </View>
        </View>
      </Animated.View>

      <View style={[styles.resultRow, styles.totalRow]}>
        <Animated.View
          entering={SlideInRight.delay(300).duration(500)}
          style={styles.resultItem}
        >
          <Text style={styles.totalLabel}>Gross Amount</Text>
          <Text style={styles.totalValue}>{formatAmount(result.grossAmount)}</Text>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeIn.delay(400).duration(500)}
        style={styles.info}
      >
        <Text style={styles.infoText}>
          {result.isInclusive
            ? `You entered a price of ${formatAmount(result.amount)} including GST.`
            : `You entered a price of ${formatAmount(result.amount)} excluding GST.`}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#1A237E',
    marginBottom: 4,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  resultRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 15,
    color: '#424242',
  },
  resultValue: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '600',
  },
  gstBreakdownSection: {
    backgroundColor: '#F8F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#1A237E',
  },
  gstBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 8,
  },
  gstBreakdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
  },
  gstComponentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  gstComponentLabel: {
    fontSize: 14,
    color: '#424242',
  },
  gstComponentValue: {
    fontSize: 15,
    color: '#212121',
    fontWeight: '500',
  },
  gstTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  gstTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A237E',
  },
  gstTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A237E',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A237E',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A237E',
  },
  info: {
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
  },
});