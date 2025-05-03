import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'gst_calculator_history';
const PREFERENCES_KEY = 'gst_calculator_preferences';

// Types
export interface Calculation {
  timestamp: string;
  description: string;
  amount: number;
  isInclusive: boolean;
  gstRate: number;
  netAmount: number;
  gstAmount: number;
  grossAmount: number;
  currency?: string;
}

export interface Preferences {
  defaultGSTRate: number;
  saveHistory: boolean;
  defaultCalculationMode?: 'inclusive' | 'exclusive';
  defaultCurrency?: string;
  darkMode?: boolean;
}

// Get preferences
export const getPreferences = async (): Promise<Preferences | null> => {
  try {
    const prefsString = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (prefsString) {
      return JSON.parse(prefsString);
    }
    return null;
  } catch (error) {
    console.error('Error getting preferences:', error);
    return null;
  }
};

// Save preferences
export const savePreferences = async (preferences: Preferences): Promise<void> => {
  try {
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
};

// Save calculation to history
export const saveCalculation = async (calculation: Calculation): Promise<void> => {
  try {
    // First check if saveHistory is enabled in preferences
    const prefs = await getPreferences();
    if (prefs && prefs.saveHistory === false) {
      // Skip saving if the user has disabled history
      return;
    }

    const historyString = await AsyncStorage.getItem(HISTORY_KEY);
    let history: Calculation[] = historyString ? JSON.parse(historyString) : [];

    // Add new calculation to history
    history.push(calculation);

    // Limit history to 50 items to prevent excessive storage usage
    if (history.length > 50) {
      history = history.slice(history.length - 50);
    }

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving calculation:', error);
    throw error;
  }
};

// Get calculation history
export const getCalculationHistory = async (): Promise<Calculation[]> => {
  try {
    const historyString = await AsyncStorage.getItem(HISTORY_KEY);
    return historyString ? JSON.parse(historyString) : [];
  } catch (error) {
    console.error('Error getting calculation history:', error);
    return [];
  }
};

// Clear history
export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};