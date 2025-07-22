import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, useColorScheme, Share } from 'react-native';
import { savePreferences, getPreferences, clearHistory, getCalculationHistory } from '@/utils/storage';
import { getReminderSettings, saveReminderSettings, ReminderSettings } from '@/utils/reminderStorage';
import { requestNotificationPermissions } from '@/utils/notificationService';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GSTSelector from '@/components/GSTSelector';
import CurrencySelector from '@/components/CurrencySelector';
import { Info, Trash2, Download, Moon, Bell, Building, DollarSign } from 'lucide-react-native';

export default function SettingsScreen() {
  const [defaultGSTRate, setDefaultGSTRate] = useState(18);
  const [saveHistory, setSaveHistory] = useState(true);
  const [defaultCalculationMode, setDefaultCalculationMode] = useState<'inclusive' | 'exclusive'>('exclusive');
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [darkMode, setDarkMode] = useState(false);
  const systemColorScheme = useColorScheme();

  // GST Reminder Settings
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    businessType: 'regular',
    annualTurnover: 0,
    reminderDays: [7, 3, 1],
    notificationsEnabled: true,
    emailReminders: false,
  });

  useEffect(() => {
    loadPreferences();
    loadReminderSettings();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getPreferences();
      if (prefs) {
        setDefaultGSTRate(prefs.defaultGSTRate || 18);
        setSaveHistory(prefs.saveHistory !== false);
        if (prefs.defaultCalculationMode) {
          setDefaultCalculationMode(prefs.defaultCalculationMode);
        }
        if (prefs.defaultCurrency) {
          setDefaultCurrency(prefs.defaultCurrency);
        }
        if (prefs.darkMode !== undefined) {
          setDarkMode(prefs.darkMode);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const loadReminderSettings = async () => {
    try {
      const settings = await getReminderSettings();
      setReminderSettings(settings);
    } catch (error) {
      console.error('Failed to load reminder settings:', error);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await savePreferences({
        defaultGSTRate,
        saveHistory,
        defaultCalculationMode,
        defaultCurrency,
        darkMode,
      });
      await saveReminderSettings(reminderSettings);
      Alert.alert('Success', 'Your preferences have been saved.');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save preferences.');
    }
  };

  const handleExportHistory = async () => {
    try {
      const history = await getCalculationHistory();
      if (!history || history.length === 0) {
        Alert.alert('No Data', 'There is no calculation history to export.');
        return;
      }

      // Convert history to CSV format
      let csvContent = 'Date,Description,Amount,GST Rate,Is Inclusive,Net Amount,GST Amount,Gross Amount\n';

      history.forEach(item => {
        const date = new Date(item.timestamp).toLocaleDateString();
        const row = [
          date,
          `"${item.description}"`,
          item.amount,
          item.gstRate,
          item.isInclusive ? 'Yes' : 'No',
          item.netAmount,
          item.gstAmount,
          item.grossAmount
        ].join(',');
        csvContent += row + '\n';
      });

      // Share the CSV content
      await Share.share({
        message: csvContent,
        title: 'GST Calculator History',
      });
    } catch (error) {
      console.error('Failed to export history:', error);
      Alert.alert('Error', 'Failed to export calculation history.');
    }
  };

  const handleNotificationPermissions = async () => {
    try {
      const permissions = await requestNotificationPermissions();
      if (permissions.granted) {
        setReminderSettings(prev => ({ ...prev, notificationsEnabled: true }));
        Alert.alert('Success', 'Notification permissions granted!');
      } else {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive GST filing reminders.'
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions.');
    }
  };

  const updateReminderSettings = (updates: Partial<ReminderSettings>) => {
    setReminderSettings(prev => ({ ...prev, ...updates }));
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all calculation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            Alert.alert('Success', 'Calculation history has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.section}>
        <Text style={styles.sectionTitle}>Default Settings</Text>
        <View style={styles.setting}>
          <Text style={styles.settingLabel}>Default GST Rate</Text>
          <GSTSelector
            selectedValue={defaultGSTRate}
            onValueChange={setDefaultGSTRate}
            containerStyle={styles.gstSelector}
          />
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingLabel}>Default Calculation Mode</Text>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                defaultCalculationMode === 'exclusive' && styles.modeButtonSelected,
              ]}
              onPress={() => setDefaultCalculationMode('exclusive')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  defaultCalculationMode === 'exclusive' && styles.modeButtonTextSelected,
                ]}
              >
                Exclusive
              </Text>
              <Text style={styles.modeButtonHint}>Amount excludes GST</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                defaultCalculationMode === 'inclusive' && styles.modeButtonSelected,
              ]}
              onPress={() => setDefaultCalculationMode('inclusive')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  defaultCalculationMode === 'inclusive' && styles.modeButtonTextSelected,
                ]}
              >
                Inclusive
              </Text>
              <Text style={styles.modeButtonHint}>Amount includes GST</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingLabel}>Default Currency</Text>
          <CurrencySelector
            selectedCurrency={defaultCurrency}
            onCurrencyChange={setDefaultCurrency}
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E0E0E0', true: '#C5CAE9' }}
              thumbColor={darkMode ? '#1A237E' : '#BDBDBD'}
            />
          </View>
          <Text style={styles.settingHint}>
            {darkMode ? 'Using dark theme' : `Using ${systemColorScheme === 'dark' ? 'light' : systemColorScheme} theme`}
          </Text>
        </View>

        <View style={styles.setting}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Save Calculation History</Text>
            <Switch
              value={saveHistory}
              onValueChange={setSaveHistory}
              trackColor={{ false: '#E0E0E0', true: '#C5CAE9' }}
              thumbColor={saveHistory ? '#1A237E' : '#BDBDBD'}
            />
          </View>
          <Text style={styles.settingHint}>
            When enabled, your calculation history will be saved for future reference
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.section}>
        <Text style={styles.sectionTitle}>GST Filing Reminders</Text>

        <View style={styles.setting}>
          <Text style={styles.settingLabel}>Business Type</Text>
          <View style={styles.businessTypeSelector}>
            <TouchableOpacity
              style={[
                styles.businessTypeButton,
                reminderSettings.businessType === 'regular' && styles.businessTypeButtonSelected,
              ]}
              onPress={() => updateReminderSettings({ businessType: 'regular' })}
            >
              <Building size={16} color={reminderSettings.businessType === 'regular' ? '#FFFFFF' : '#1A237E'} />
              <Text
                style={[
                  styles.businessTypeText,
                  reminderSettings.businessType === 'regular' && styles.businessTypeTextSelected,
                ]}
              >
                Regular
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.businessTypeButton,
                reminderSettings.businessType === 'composition' && styles.businessTypeButtonSelected,
              ]}
              onPress={() => updateReminderSettings({ businessType: 'composition' })}
            >
              <DollarSign size={16} color={reminderSettings.businessType === 'composition' ? '#FFFFFF' : '#1A237E'} />
              <Text
                style={[
                  styles.businessTypeText,
                  reminderSettings.businessType === 'composition' && styles.businessTypeTextSelected,
                ]}
              >
                Composition
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.setting}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={reminderSettings.notificationsEnabled}
              onValueChange={(value) => {
                if (value) {
                  handleNotificationPermissions();
                } else {
                  updateReminderSettings({ notificationsEnabled: false });
                }
              }}
              trackColor={{ false: '#E0E0E0', true: '#C5CAE9' }}
              thumbColor={reminderSettings.notificationsEnabled ? '#1A237E' : '#BDBDBD'}
            />
          </View>
          <Text style={styles.settingHint}>
            Receive notifications for upcoming GST filing due dates
          </Text>
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingLabel}>Reminder Days</Text>
          <Text style={styles.settingHint}>
            Get notified {reminderSettings.reminderDays.join(', ')} days before due date
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity style={styles.dataButtonExport} onPress={handleExportHistory}>
          <Download size={20} color="#1A237E" />
          <Text style={styles.dataButtonTextExport}>Export Calculation History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.dataButton, { marginTop: 12 }]} onPress={handleClearHistory}>
          <Trash2 size={20} color="#FF5252" />
          <Text style={styles.dataButtonTextDanger}>Clear Calculation History</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.infoSection}>
        <View style={styles.infoHeader}>
          <Info size={20} color="#1A237E" />
          <Text style={styles.infoTitle}>About GST in India</Text>
        </View>
        <Text style={styles.infoText}>
          GST (Goods and Services Tax) is an indirect tax levied on the supply of goods and services in India. It replaced many indirect taxes in India such as excise duty, VAT, and services tax.
        </Text>
        <Text style={styles.infoText}>
          Standard GST rates in India are 5%, 12%, 18%, 28%, and 40%.
        </Text>
      </Animated.View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSavePreferences}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  setting: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 8,
  },
  settingHint: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  gstSelector: {
    marginTop: 8,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modeButtonSelected: {
    backgroundColor: '#E8EAF6',
    borderWidth: 1,
    borderColor: '#1A237E',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
  },
  modeButtonTextSelected: {
    color: '#1A237E',
  },
  modeButtonHint: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 16,
  },
  dataButtonExport: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
    padding: 16,
  },
  dataButtonTextDanger: {
    color: '#FF5252',
    fontWeight: '500',
    marginLeft: 12,
  },
  dataButtonTextExport: {
    color: '#1A237E',
    fontWeight: '500',
    marginLeft: 12,
  },
  infoSection: {
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A237E',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#1A237E',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  businessTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  businessTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  businessTypeButtonSelected: {
    backgroundColor: '#1A237E',
    borderColor: '#1A237E',
  },
  businessTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A237E',
    marginLeft: 6,
  },
  businessTypeTextSelected: {
    color: '#FFFFFF',
  },
});