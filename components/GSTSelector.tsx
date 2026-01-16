import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';

interface GSTSelectorProps {
  selectedValue: number;
  onValueChange: (value: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const GST_RATES = [5, 12, 18, 28, 40];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function RateButton({ 
  rate, 
  isSelected, 
  onPress 
}: { 
  rate: number; 
  isSelected: boolean; 
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedTouchable
      style={[styles.rateButton, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {isSelected ? (
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#A855F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.selectedGradient}
        >
          <View style={styles.rateContent}>
            <Check size={14} color="#FFFFFF" strokeWidth={3} style={styles.checkIcon} />
            <Text style={styles.selectedRateText}>{rate}%</Text>
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.unselectedButton}>
          <Text style={styles.rateText}>{rate}%</Text>
        </View>
      )}
    </AnimatedTouchable>
  );
}

export default function GSTSelector({ 
  selectedValue, 
  onValueChange,
  containerStyle 
}: GSTSelectorProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.ratesRow}>
        {GST_RATES.map((rate) => (
          <RateButton
            key={rate}
            rate={rate}
            isSelected={selectedValue === rate}
            onPress={() => onValueChange(rate)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  ratesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rateButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedGradient: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  unselectedButton: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  rateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    marginRight: 4,
  },
  rateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6366F1',
  },
  selectedRateText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});