import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { currencies } from '@/utils/currency';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export default function CurrencySelector({ selectedCurrency, onCurrencyChange }: CurrencySelectorProps) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <Text style={styles.label}>Select Currency</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {currencies.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.currencyButton,
              selectedCurrency === currency.code && styles.selectedCurrency,
            ]}
            onPress={() => onCurrencyChange(currency.code)}
          >
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <Text style={[
              styles.currencyCode,
              selectedCurrency === currency.code && styles.selectedText,
            ]}>
              {currency.code}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  scrollContent: {
    paddingRight: 16,
  },
  currencyButton: {
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  selectedCurrency: {
    backgroundColor: '#E8EAF6',
    borderWidth: 1,
    borderColor: '#1A237E',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 12,
    color: '#757575',
  },
  selectedText: {
    color: '#1A237E',
    fontWeight: '600',
  },
});
