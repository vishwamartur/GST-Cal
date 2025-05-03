import { useState, useEffect } from 'react';
import { getPreferences, Preferences } from '@/utils/storage';

interface UsePreferencesReturn {
  defaultGSTRate: number;
  defaultCalculationMode: 'inclusive' | 'exclusive';
  saveHistory: boolean;
  defaultCurrency: string;
  darkMode: boolean;
  isLoading: boolean;
}

export function useSavedPreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await getPreferences();
        setPreferences(prefs);
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  return {
    defaultGSTRate: preferences?.defaultGSTRate ?? 18,
    defaultCalculationMode: preferences?.defaultCalculationMode ?? 'exclusive',
    saveHistory: preferences?.saveHistory !== false, // Default to true
    defaultCurrency: preferences?.defaultCurrency ?? 'INR',
    darkMode: preferences?.darkMode ?? false,
    isLoading,
  };
}