import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';

interface GSTSelectorProps {
  selectedValue: number;
  onValueChange: (value: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const GST_RATES = [40, 5, 12, 18, 28];

export default function GSTSelector({ 
  selectedValue, 
  onValueChange,
  containerStyle 
}: GSTSelectorProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {GST_RATES.map((rate) => (
        <TouchableOpacity
          key={rate}
          style={[
            styles.rateButton,
            selectedValue === rate && styles.selectedRateButton,
          ]}
          onPress={() => onValueChange(rate)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.rateText,
              selectedValue === rate && styles.selectedRateText,
            ]}
          >
            {rate}%
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    margin: 4,
  },
  selectedRateButton: {
    backgroundColor: '#1A237E',
  },
  rateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
  },
  selectedRateText: {
    color: '#FFFFFF',
  },
});