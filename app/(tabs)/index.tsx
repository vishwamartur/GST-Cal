import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Share,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { saveCalculation } from '@/utils/storage';
import { useSavedPreferences } from '@/hooks/usePreferences';
import { ArrowRight, Share2 } from 'lucide-react-native';
import GSTSelector from '@/components/GSTSelector';
import ResultCard from '@/components/ResultCard';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency';

export default function CalculatorScreen() {
  const router = useRouter();
  const { defaultGSTRate, defaultCalculationMode, defaultCurrency } = useSavedPreferences();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGST, setSelectedGST] = useState(defaultGSTRate);
  const [isInclusive, setIsInclusive] = useState(defaultCalculationMode === 'inclusive');
  const [result, setResult] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const calculateGST = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return;
    }

    const numAmount = parseFloat(amount);
    const gstRate = selectedGST / 100;

    let netAmount, gstAmount, grossAmount;

    if (isInclusive) {
      // Inclusive calculation (amount includes GST)
      grossAmount = numAmount;
      netAmount = numAmount / (1 + gstRate);
      gstAmount = grossAmount - netAmount;
    } else {
      // Exclusive calculation (amount is without GST)
      netAmount = numAmount;
      gstAmount = numAmount * gstRate;
      grossAmount = netAmount + gstAmount;
    }

    const calculationResult = {
      timestamp: new Date().toISOString(),
      description: description || 'Unnamed Item',
      amount: numAmount,
      isInclusive,
      gstRate: selectedGST,
      netAmount,
      gstAmount,
      grossAmount,
      currency: defaultCurrency,
    };

    setResult(calculationResult);
    saveCalculation(calculationResult);
    Keyboard.dismiss();
  };

  const handleShareResult = async () => {
    if (!result) return;

    try {
      const currencySymbol = getCurrencySymbol(result.currency || defaultCurrency);

      const message =
        `GST Calculation for ${result.description}\n\n` +
        `Amount: ${formatCurrency(result.amount, result.currency || defaultCurrency)}\n` +
        `GST Rate: ${result.gstRate}%\n` +
        `Net Amount: ${formatCurrency(result.netAmount, result.currency || defaultCurrency)}\n` +
        `GST Amount: ${formatCurrency(result.gstAmount, result.currency || defaultCurrency)}\n` +
        `Gross Amount: ${formatCurrency(result.grossAmount, result.currency || defaultCurrency)}`;

      await Share.share({
        message,
        title: 'GST Calculation Result',
      });
    } catch (error) {
      console.error('Error sharing result:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.inputContainer}>
          <Text style={styles.label}>Item Description (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Office Supplies"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#9E9E9E"
          />

          <Text style={styles.label}>Amount ({getCurrencySymbol(defaultCurrency)})</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor="#9E9E9E"
          />

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>
              {isInclusive ? 'Amount includes GST' : 'Amount excludes GST'}
            </Text>
            <Switch
              value={isInclusive}
              onValueChange={setIsInclusive}
              trackColor={{ false: '#E0E0E0', true: '#C5CAE9' }}
              thumbColor={isInclusive ? '#1A237E' : '#BDBDBD'}
            />
          </View>

          <Text style={styles.label}>GST Rate</Text>
          <GSTSelector selectedValue={selectedGST} onValueChange={setSelectedGST} />

          <TouchableOpacity
            style={styles.calculateButton}
            onPress={calculateGST}
            activeOpacity={0.8}
          >
            <Text style={styles.calculateButtonText}>Calculate</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {result && (
          <Animated.View entering={FadeIn.delay(300).duration(500)} style={styles.resultContainer}>
            <ResultCard result={result} />

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareResult}
              activeOpacity={0.8}
            >
              <Share2 size={20} color="#1A237E" />
              <Text style={styles.shareButtonText}>Share Result</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  calculateButton: {
    backgroundColor: '#1A237E',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  resultContainer: {
    marginTop: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  shareButtonText: {
    color: '#1A237E',
    fontWeight: '600',
    marginLeft: 8,
  },
});