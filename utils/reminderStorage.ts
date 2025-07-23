import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReminderSettings {
  businessType: 'regular' | 'composition' | 'nil';
  annualTurnover: number;
  reminderDays: number[]; // Days before due date to remind (e.g., [7, 3, 1])
  notificationsEnabled: boolean;
  emailReminders: boolean;
  emailAddress?: string;
}

export interface FilingReminder {
  id: string;
  returnType: string;
  returnName: string;
  dueDate: string; // ISO date string
  period: string;
  reminderDates: string[]; // ISO date strings
  isCompleted: boolean;
  completedDate?: string;
  notificationIds: string[]; // For canceling notifications
}

export interface FilingHistory {
  id: string;
  returnType: string;
  returnName: string;
  period: string;
  dueDate: string;
  filedDate: string;
  status: 'filed' | 'late' | 'pending';
}

const STORAGE_KEYS = {
  REMINDER_SETTINGS: 'gst_reminder_settings',
  ACTIVE_REMINDERS: 'gst_active_reminders',
  FILING_HISTORY: 'gst_filing_history',
};

// Default settings
const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  businessType: 'regular',
  annualTurnover: 0,
  reminderDays: [7, 3, 1], // 7 days, 3 days, 1 day before
  notificationsEnabled: true,
  emailReminders: false,
};

// Reminder Settings
export async function getReminderSettings(): Promise<ReminderSettings> {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS);
    return settings ? JSON.parse(settings) : DEFAULT_REMINDER_SETTINGS;
  } catch (error) {
    console.error('Error getting reminder settings:', error);
    return DEFAULT_REMINDER_SETTINGS;
  }
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving reminder settings:', error);
    throw error;
  }
}

// Active Reminders
export async function getActiveReminders(): Promise<FilingReminder[]> {
  try {
    const reminders = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_REMINDERS);
    return reminders ? JSON.parse(reminders) : [];
  } catch (error) {
    console.error('Error getting active reminders:', error);
    return [];
  }
}

export async function saveActiveReminders(reminders: FilingReminder[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_REMINDERS, JSON.stringify(reminders));
  } catch (error) {
    console.error('Error saving active reminders:', error);
    throw error;
  }
}

export async function addReminder(reminder: FilingReminder): Promise<void> {
  try {
    const reminders = await getActiveReminders();
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);
    
    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
    }
    
    await saveActiveReminders(reminders);
  } catch (error) {
    console.error('Error adding reminder:', error);
    throw error;
  }
}

export async function removeReminder(reminderId: string): Promise<void> {
  try {
    const reminders = await getActiveReminders();
    const filteredReminders = reminders.filter(r => r.id !== reminderId);
    await saveActiveReminders(filteredReminders);
  } catch (error) {
    console.error('Error removing reminder:', error);
    throw error;
  }
}

export async function markReminderCompleted(reminderId: string, filedDate: Date): Promise<void> {
  try {
    const reminders = await getActiveReminders();
    const reminderIndex = reminders.findIndex(r => r.id === reminderId);
    
    if (reminderIndex >= 0) {
      const reminder = reminders[reminderIndex];
      reminder.isCompleted = true;
      reminder.completedDate = filedDate.toISOString();
      
      // Add to filing history
      const historyEntry: FilingHistory = {
        id: `${reminder.id}_${Date.now()}`,
        returnType: reminder.returnType,
        returnName: reminder.returnName,
        period: reminder.period,
        dueDate: reminder.dueDate,
        filedDate: filedDate.toISOString(),
        status: new Date(reminder.dueDate) < filedDate ? 'late' : 'filed',
      };
      
      await addToFilingHistory(historyEntry);
      await saveActiveReminders(reminders);
    }
  } catch (error) {
    console.error('Error marking reminder completed:', error);
    throw error;
  }
}

// Filing History
export async function getFilingHistory(): Promise<FilingHistory[]> {
  try {
    const history = await AsyncStorage.getItem(STORAGE_KEYS.FILING_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting filing history:', error);
    return [];
  }
}

export async function saveFilingHistory(history: FilingHistory[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FILING_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving filing history:', error);
    throw error;
  }
}

export async function addToFilingHistory(entry: FilingHistory): Promise<void> {
  try {
    const history = await getFilingHistory();
    history.unshift(entry); // Add to beginning
    
    // Keep only last 50 entries
    if (history.length > 50) {
      history.splice(50);
    }
    
    await saveFilingHistory(history);
  } catch (error) {
    console.error('Error adding to filing history:', error);
    throw error;
  }
}

// Utility functions
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.REMINDER_SETTINGS,
      STORAGE_KEYS.ACTIVE_REMINDERS,
      STORAGE_KEYS.FILING_HISTORY,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

export async function getUpcomingReminders(days: number = 30): Promise<FilingReminder[]> {
  try {
    const reminders = await getActiveReminders();
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return reminders.filter(reminder => {
      if (reminder.isCompleted) return false;
      
      const dueDate = new Date(reminder.dueDate);
      return dueDate >= now && dueDate <= futureDate;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  } catch (error) {
    console.error('Error getting upcoming reminders:', error);
    return [];
  }
}

export async function getOverdueReminders(): Promise<FilingReminder[]> {
  try {
    const reminders = await getActiveReminders();
    const now = new Date();
    
    return reminders.filter(reminder => {
      if (reminder.isCompleted) return false;
      
      const dueDate = new Date(reminder.dueDate);
      return dueDate < now;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  } catch (error) {
    console.error('Error getting overdue reminders:', error);
    return [];
  }
}
