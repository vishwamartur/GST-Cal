import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Bell, Calendar, CheckCircle, AlertTriangle, Settings, Plus } from 'lucide-react-native';
import GSTCalendar from '../../components/GSTCalendar';
import { FilingDate, getUpcomingFilingDates } from '../../utils/gstFilingDates';
import {
  FilingReminder,
  getReminderSettings,
  getActiveReminders,
  addReminder,
  markReminderCompleted,
  getUpcomingReminders,
  getOverdueReminders,
} from '../../utils/reminderStorage';
import { scheduleFilingReminder, cancelNotifications, requestNotificationPermissions } from '../../utils/notificationService';

type ViewMode = 'list' | 'calendar';

export default function RemindersScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [upcomingReminders, setUpcomingReminders] = useState<FilingReminder[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<FilingReminder[]>([]);
  const [filingDates, setFilingDates] = useState<FilingDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadReminders(),
        loadFilingDates(),
        checkNotificationSettings(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const [upcoming, overdue] = await Promise.all([
        getUpcomingReminders(30),
        getOverdueReminders(),
      ]);
      setUpcomingReminders(upcoming);
      setOverdueReminders(overdue);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const loadFilingDates = async () => {
    try {
      const settings = await getReminderSettings();
      const dates = getUpcomingFilingDates(
        settings.businessType,
        settings.annualTurnover,
        90
      );
      setFilingDates(dates);
    } catch (error) {
      console.error('Error loading filing dates:', error);
    }
  };

  const checkNotificationSettings = async () => {
    try {
      const settings = await getReminderSettings();
      setNotificationsEnabled(settings.notificationsEnabled);
    } catch (error) {
      console.error('Error checking notification settings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleReminderToggle = async (filing: FilingDate, enabled: boolean) => {
    try {
      if (enabled) {
        // Create and schedule reminder
        const reminder: FilingReminder = {
          id: filing.id,
          returnType: filing.returnType,
          returnName: filing.returnName,
          dueDate: filing.dueDate.toISOString(),
          period: filing.period,
          reminderDates: [], // Will be calculated by notification service
          isCompleted: false,
          notificationIds: [],
        };

        const notificationIds = await scheduleFilingReminder(reminder);
        reminder.notificationIds = notificationIds;
        
        await addReminder(reminder);
        Alert.alert('Success', `Reminder set for ${filing.returnName}`);
      } else {
        // Cancel reminder
        const activeReminders = await getActiveReminders();
        const existingReminder = activeReminders.find(r => r.id === filing.id);
        
        if (existingReminder) {
          await cancelNotifications(existingReminder.notificationIds);
          // Remove from active reminders would be handled by the storage function
        }
        
        Alert.alert('Success', `Reminder cancelled for ${filing.returnName}`);
      }
      
      await loadReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Error', 'Failed to update reminder. Please try again.');
    }
  };

  const handleMarkCompleted = async (reminder: FilingReminder) => {
    Alert.alert(
      'Mark as Filed',
      `Mark ${reminder.returnName} for ${reminder.period} as filed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Filed',
          onPress: async () => {
            try {
              await markReminderCompleted(reminder.id, new Date());
              await cancelNotifications(reminder.notificationIds);
              await loadReminders();
              Alert.alert('Success', 'Return marked as filed!');
            } catch (error) {
              console.error('Error marking completed:', error);
              Alert.alert('Error', 'Failed to mark as completed. Please try again.');
            }
          },
        },
      ]
    );
  };

  const requestPermissions = async () => {
    try {
      const permissions = await requestNotificationPermissions();
      if (permissions.granted) {
        Alert.alert('Success', 'Notification permissions granted!');
      } else {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive GST filing reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {/* Open device settings */} },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysText = (reminder: FilingReminder) => {
    const dueDate = new Date(reminder.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const renderReminderItem = (reminder: FilingReminder, isOverdue: boolean = false) => (
    <View key={reminder.id} style={[styles.reminderItem, isOverdue && styles.overdueItem]}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <View style={styles.iconContainer}>
            {isOverdue ? (
              <AlertTriangle size={20} color="#F44336" />
            ) : (
              <Bell size={20} color="#1A237E" />
            )}
          </View>
          <View style={styles.reminderDetails}>
            <Text style={styles.reminderTitle}>{reminder.returnName}</Text>
            <Text style={styles.reminderPeriod}>{reminder.period}</Text>
            <Text style={[styles.reminderDue, isOverdue && styles.overdueDue]}>
              {getDaysText(reminder)} • {formatDate(reminder.dueDate)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleMarkCompleted(reminder)}
        >
          <CheckCircle size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading reminders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>GST Filing Reminders</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#1A237E" />
          </TouchableOpacity>
        </View>
        
        {/* View Mode Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
            onPress={() => setViewMode('list')}
          >
            <Bell size={16} color={viewMode === 'list' ? '#FFFFFF' : '#1A237E'} />
            <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>
              List
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'calendar' && styles.activeToggle]}
            onPress={() => setViewMode('calendar')}
          >
            <Calendar size={16} color={viewMode === 'calendar' ? '#FFFFFF' : '#1A237E'} />
            <Text style={[styles.toggleText, viewMode === 'calendar' && styles.activeToggleText]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'calendar' ? (
        <GSTCalendar
          onDateSelect={(date, filings) => {
            console.log('Selected date:', date, filings);
          }}
          onReminderToggle={handleReminderToggle}
        />
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Notification Permission Banner */}
          {!notificationsEnabled && (
            <TouchableOpacity style={styles.permissionBanner} onPress={requestPermissions}>
              <AlertTriangle size={20} color="#FF9800" />
              <Text style={styles.permissionText}>
                Enable notifications to receive GST filing reminders
              </Text>
            </TouchableOpacity>
          )}

          {/* Overdue Reminders */}
          {overdueReminders.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overdue ({overdueReminders.length})</Text>
              {overdueReminders.map(reminder => renderReminderItem(reminder, true))}
            </View>
          )}

          {/* Upcoming Reminders */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Upcoming ({upcomingReminders.length})
            </Text>
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map(reminder => renderReminderItem(reminder))
            ) : (
              <View style={styles.emptyState}>
                <Bell size={48} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>No upcoming reminders</Text>
                <Text style={styles.emptySubtitle}>
                  Set up reminders for your GST filing dates
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Plus size={20} color="#1A237E" />
              <Text style={styles.actionText}>Add Custom Reminder</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A237E',
  },
  settingsButton: {
    padding: 4,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#1A237E',
  },
  toggleText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A237E',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  permissionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#E65100',
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  reminderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1A237E',
  },
  overdueItem: {
    borderLeftColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  reminderPeriod: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  reminderDue: {
    fontSize: 12,
    color: '#1A237E',
    marginTop: 4,
  },
  overdueDue: {
    color: '#F44336',
    fontWeight: '600',
  },
  completeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActions: {
    margin: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1A237E',
    borderStyle: 'dashed',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#1A237E',
  },
});
