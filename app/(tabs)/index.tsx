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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { saveCalculation } from '@/utils/storage';
import { useSavedPreferences } from '@/hooks/usePreferences';
import { ArrowRight, Share2, Calculator, Sparkles } from 'lucide-react-native';
import GSTSelector from '@/components/GSTSelector';
import ResultCard from '@/components/ResultCard';
import { getCurrencySymbol, formatCurrency } from '@/utils/currency';

interface CalculationResult {
  timestamp: string;
  description: string;
  amount: number;
  isInclusive: boolean;
  gstRate: number;
  netAmount: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  grossAmount: number;
  currency: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function CalculatorScreen() {
  const router = useRouter();
  const { defaultGSTRate, defaultCalculationMode, defaultCurrency } = useSavedPreferences();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGST, setSelectedGST] = useState(defaultGSTRate);
  const [isInclusive, setIsInclusive] = useState(defaultCalculationMode === 'inclusive');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Animation values
  const buttonScale = useSharedValue(1);

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

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const calculateGST = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return;
    }

    const numAmount = parseFloat(amount);
    const gstRate = selectedGST / 100;

    let netAmount, gstAmount, grossAmount, cgstAmount, sgstAmount;

    if (isInclusive) {
      grossAmount = numAmount;
      netAmount = numAmount / (1 + gstRate);
      gstAmount = grossAmount - netAmount;
    } else {
      netAmount = numAmount;
      gstAmount = numAmount * gstRate;
      grossAmount = netAmount + gstAmount;
    }

    cgstAmount = gstAmount / 2;
    sgstAmount = gstAmount / 2;

    const calculationResult = {
      timestamp: new Date().toISOString(),
      description: description || 'Unnamed Item',
      amount: numAmount,
      isInclusive,
      gstRate: selectedGST,
      netAmount,
      gstAmount,
      cgstAmount,
      sgstAmount,
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
      const message =
        `GST Calculation for ${result.description}\n\n` +
        `Amount: ${formatCurrency(result.amount, result.currency || defaultCurrency)}\n` +
        `GST Rate: ${result.gstRate}%\n` +
        `Net Amount: ${formatCurrency(result.netAmount, result.currency || defaultCurrency)}\n` +
        `CGST (${result.gstRate / 2}%): ${formatCurrency(result.cgstAmount, result.currency || defaultCurrency)}\n` +
        `SGST (${result.gstRate / 2}%): ${formatCurrency(result.sgstAmount, result.currency || defaultCurrency)}\n` +
        `Total GST: ${formatCurrency(result.gstAmount, result.currency || defaultCurrency)}\n` +
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
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#A855F7', '#C084FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      {/* Decorative Circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View entering={FadeInDown.delay(50).duration(500)} style={styles.header}>
            <View style={styles.headerIcon}>
              <Calculator size={28} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>GST Calculator</Text>
              <Text style={styles.headerSubtitle}>Calculate tax instantly</Text>
            </View>
          </Animated.View>

          {/* Input Card with Glassmorphism */}
          <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.cardWrapper}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={80} tint="light" style={styles.inputCard}>
                <InputContent
                  description={description}
                  setDescription={setDescription}
                  amount={amount}
                  setAmount={setAmount}
                  defaultCurrency={defaultCurrency}
                  isInclusive={isInclusive}
                  setIsInclusive={setIsInclusive}
                  selectedGST={selectedGST}
                  setSelectedGST={setSelectedGST}
                  buttonAnimatedStyle={buttonAnimatedStyle}
                  handlePressIn={handlePressIn}
                  handlePressOut={handlePressOut}
                  calculateGST={calculateGST}
                />
              </BlurView>
            ) : (
              <View style={[styles.inputCard, styles.inputCardAndroid]}>
                <InputContent
                  description={description}
                  setDescription={setDescription}
                  amount={amount}
                  setAmount={setAmount}
                  defaultCurrency={defaultCurrency}
                  isInclusive={isInclusive}
                  setIsInclusive={setIsInclusive}
                  selectedGST={selectedGST}
                  setSelectedGST={setSelectedGST}
                  buttonAnimatedStyle={buttonAnimatedStyle}
                  handlePressIn={handlePressIn}
                  handlePressOut={handlePressOut}
                  calculateGST={calculateGST}
                />
              </View>
            )}
          </Animated.View>

          {/* Result Section */}
          {result && (
            <Animated.View entering={FadeIn.delay(200).duration(500)} style={styles.resultContainer}>
              <ResultCard result={result} />

              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareResult}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.shareButtonGradient}
                >
                  <Share2 size={18} color="#6366F1" />
                  <Text style={styles.shareButtonText}>Share Result</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Extracted Input Content Component
function InputContent({
  description,
  setDescription,
  amount,
  setAmount,
  defaultCurrency,
  isInclusive,
  setIsInclusive,
  selectedGST,
  setSelectedGST,
  buttonAnimatedStyle,
  handlePressIn,
  handlePressOut,
  calculateGST,
}: any) {
  return (
    <View style={styles.inputContent}>
      {/* Description Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Item Description</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Office Supplies"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Amount Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount ({getCurrencySymbol(defaultCurrency)})</Text>
        <TextInput
          style={[styles.input, styles.amountInput]}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Toggle Switch */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleLeft}>
          <Sparkles size={18} color="#6366F1" />
          <Text style={styles.toggleLabel}>
            {isInclusive ? 'Amount includes GST' : 'Amount excludes GST'}
          </Text>
        </View>
        <Switch
          value={isInclusive}
          onValueChange={setIsInclusive}
          trackColor={{ false: '#E2E8F0', true: '#C4B5FD' }}
          thumbColor={isInclusive ? '#6366F1' : '#94A3B8'}
          ios_backgroundColor="#E2E8F0"
        />
      </View>

      {/* GST Rate Selector */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>GST Rate</Text>
        <GSTSelector selectedValue={selectedGST} onValueChange={setSelectedGST} />
      </View>

      {/* Calculate Button */}
      <AnimatedTouchable
        style={[styles.calculateButton, buttonAnimatedStyle]}
        onPress={calculateGST}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.calculateButtonGradient}
        >
          <Text style={styles.calculateButtonText}>Calculate GST</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </LinearGradient>
      </AnimatedTouchable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366F1',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: 200,
    left: -80,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    bottom: 100,
    right: -50,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  inputCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  inputCardAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  inputContent: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
    marginLeft: 10,
  },
  calculateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  calculateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 10,
    letterSpacing: 0.3,
  },
  resultContainer: {
    marginTop: 24,
  },
  shareButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  shareButtonText: {
    color: '#6366F1',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 15,
  },
});