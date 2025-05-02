import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface CalculationHistoryItem {
  expression: string;
  result: string;
  timestamp: string;
}

export default function BasicCalculator() {
  const [display, setDisplay] = useState('0');
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [resetOnNextInput, setResetOnNextInput] = useState(false);
  const [calculationHistory, setCalculationHistory] = useState<CalculationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleNumberPress = (num: string) => {
    if (display === '0' || resetOnNextInput) {
      setDisplay(num);
      setResetOnNextInput(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperationPress = (operation: string) => {
    const currentValue = parseFloat(display);

    if (previousValue !== null && currentOperation) {
      // Calculate the result of the previous operation
      const result = calculateResult(previousValue, currentValue, currentOperation);
      setDisplay(result.toString());
      setPreviousValue(result);
    } else {
      setPreviousValue(currentValue);
    }

    setCurrentOperation(operation);
    setResetOnNextInput(true);
  };

  const handleEqualsPress = () => {
    if (previousValue !== null && currentOperation) {
      const currentValue = parseFloat(display);
      const result = calculateResult(previousValue, currentValue, currentOperation);
      const resultString = result.toString();

      // Create expression string for history
      const expression = `${previousValue} ${currentOperation} ${currentValue}`;

      // Add to history
      const historyItem: CalculationHistoryItem = {
        expression,
        result: resultString,
        timestamp: new Date().toISOString(),
      };

      setCalculationHistory([historyItem, ...calculationHistory.slice(0, 9)]);
      setDisplay(resultString);
      setPreviousValue(null);
      setCurrentOperation(null);
      setResetOnNextInput(true);
    }
  };

  const calculateResult = (a: number, b: number, operation: string): number => {
    switch (operation) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return a / b;
      default:
        return b;
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setCurrentOperation(null);
    setResetOnNextInput(false);
  };

  const handleDecimalPress = () => {
    if (resetOnNextInput) {
      setDisplay('0.');
      setResetOnNextInput(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handlePercentPress = () => {
    const value = parseFloat(display) / 100;
    setDisplay(value.toString());
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const renderButton = (text: string, onPress: () => void, buttonStyle?: object, textStyle?: object) => (
    <TouchableOpacity
      style={[styles.button, buttonStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Basic Calculator</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={toggleHistory}
          activeOpacity={0.7}
        >
          <Text style={styles.historyButtonText}>
            {showHistory ? 'Hide History' : 'Show History'}
          </Text>
        </TouchableOpacity>
      </View>

      {showHistory && calculationHistory.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.historyContainer}
        >
          <ScrollView style={styles.historyScroll}>
            {calculationHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyExpression}>{item.expression} =</Text>
                <Text style={styles.historyResult}>{item.result}</Text>
                <Text style={styles.historyTime}>{formatDate(item.timestamp)}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <View style={styles.displayContainer}>
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
        {currentOperation && (
          <Text style={styles.operation}>{currentOperation}</Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        {renderButton('C', handleClear, styles.functionButton, styles.functionButtonText)}
        {renderButton('⌫', handleBackspace, styles.functionButton, styles.functionButtonText)}
        {renderButton('%', handlePercentPress, styles.functionButton, styles.functionButtonText)}
        {renderButton('÷', () => handleOperationPress('÷'), styles.operationButton, styles.operationButtonText)}
      </View>

      <View style={styles.buttonRow}>
        {renderButton('7', () => handleNumberPress('7'))}
        {renderButton('8', () => handleNumberPress('8'))}
        {renderButton('9', () => handleNumberPress('9'))}
        {renderButton('×', () => handleOperationPress('×'), styles.operationButton, styles.operationButtonText)}
      </View>

      <View style={styles.buttonRow}>
        {renderButton('4', () => handleNumberPress('4'))}
        {renderButton('5', () => handleNumberPress('5'))}
        {renderButton('6', () => handleNumberPress('6'))}
        {renderButton('-', () => handleOperationPress('-'), styles.operationButton, styles.operationButtonText)}
      </View>

      <View style={styles.buttonRow}>
        {renderButton('1', () => handleNumberPress('1'))}
        {renderButton('2', () => handleNumberPress('2'))}
        {renderButton('3', () => handleNumberPress('3'))}
        {renderButton('+', () => handleOperationPress('+'), styles.operationButton, styles.operationButtonText)}
      </View>

      <View style={styles.buttonRow}>
        {renderButton('0', () => handleNumberPress('0'), styles.zeroButton)}
        {renderButton('.', handleDecimalPress)}
        {renderButton('=', handleEqualsPress, styles.equalsButton, styles.equalsButtonText)}
      </View>
    </Animated.View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  historyButton: {
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  historyButtonText: {
    color: '#1A237E',
    fontWeight: '500',
    fontSize: 14,
  },
  historyContainer: {
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    maxHeight: 200,
  },
  historyScroll: {
    maxHeight: 176,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 8,
  },
  historyExpression: {
    fontSize: 14,
    color: '#757575',
  },
  historyResult: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  historyTime: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  displayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    minHeight: 80,
  },
  display: {
    fontSize: 36,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    textAlign: 'right',
  },
  operation: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A237E',
    marginLeft: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    height: 64,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#212121',
  },
  functionButton: {
    backgroundColor: '#E8EAF6',
  },
  functionButtonText: {
    color: '#1A237E',
  },
  operationButton: {
    backgroundColor: '#1A237E',
  },
  operationButtonText: {
    color: '#FFFFFF',
  },
  equalsButton: {
    backgroundColor: '#1A237E',
  },
  equalsButtonText: {
    color: '#FFFFFF',
  },
  zeroButton: {
    flex: 2,
  },
});
