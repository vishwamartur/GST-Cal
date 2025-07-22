import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { FilingReminder, getReminderSettings } from './reminderStorage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPermissions {
  granted: boolean;
  canAskAgain: boolean;
  status: Notifications.PermissionStatus;
}

export async function requestNotificationPermissions(): Promise<NotificationPermissions> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // For Android, set up notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('gst-reminders', {
        name: 'GST Filing Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1A237E',
        sound: 'default',
        description: 'Notifications for GST filing due dates and reminders',
      });
    }
    
    return {
      granted: finalStatus === 'granted',
      canAskAgain: existingStatus !== 'denied',
      status: finalStatus,
    };
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'denied' as Notifications.PermissionStatus,
    };
  }
}

export async function scheduleFilingReminder(reminder: FilingReminder): Promise<string[]> {
  try {
    const permissions = await requestNotificationPermissions();
    if (!permissions.granted) {
      throw new Error('Notification permissions not granted');
    }
    
    const settings = await getReminderSettings();
    if (!settings.notificationsEnabled) {
      return [];
    }
    
    const dueDate = new Date(reminder.dueDate);
    const notificationIds: string[] = [];
    
    // Schedule notifications for each reminder day
    for (const daysBefore of settings.reminderDays) {
      const notificationDate = new Date(dueDate);
      notificationDate.setDate(notificationDate.getDate() - daysBefore);
      notificationDate.setHours(9, 0, 0, 0); // 9 AM
      
      // Only schedule if the notification date is in the future
      if (notificationDate > new Date()) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `GST Filing Reminder - ${reminder.returnName}`,
            body: getNotificationBody(reminder, daysBefore),
            data: {
              reminderId: reminder.id,
              returnType: reminder.returnType,
              dueDate: reminder.dueDate,
              daysBefore,
            },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            date: notificationDate,
            channelId: 'gst-reminders',
          },
        });
        
        notificationIds.push(notificationId);
      }
    }
    
    // Schedule a notification on the due date
    if (dueDate > new Date()) {
      const dueDateNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `GST Filing Due Today - ${reminder.returnName}`,
          body: `${reminder.returnName} for ${reminder.period} is due today. Don't forget to file!`,
          data: {
            reminderId: reminder.id,
            returnType: reminder.returnType,
            dueDate: reminder.dueDate,
            daysBefore: 0,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: new Date(dueDate.setHours(9, 0, 0, 0)),
          channelId: 'gst-reminders',
        },
      });
      
      notificationIds.push(dueDateNotificationId);
    }
    
    return notificationIds;
  } catch (error) {
    console.error('Error scheduling filing reminder:', error);
    return [];
  }
}

export async function cancelNotifications(notificationIds: string[]): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationIds[0]);
    // For multiple notifications, cancel them individually
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

export async function cancelAllGSTNotifications(): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const gstNotifications = scheduledNotifications.filter(
      notification => notification.content.data?.returnType
    );
    
    for (const notification of gstNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error canceling all GST notifications:', error);
  }
}

export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

function getNotificationBody(reminder: FilingReminder, daysBefore: number): string {
  const dueDate = new Date(reminder.dueDate);
  const formattedDate = dueDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  if (daysBefore === 0) {
    return `${reminder.returnName} for ${reminder.period} is due today!`;
  } else if (daysBefore === 1) {
    return `${reminder.returnName} for ${reminder.period} is due tomorrow (${formattedDate})`;
  } else {
    return `${reminder.returnName} for ${reminder.period} is due in ${daysBefore} days (${formattedDate})`;
  }
}

export function setupNotificationListeners() {
  // Handle notification received while app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received in foreground:', notification);
  });
  
  // Handle notification response (when user taps notification)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response:', response);
    const data = response.notification.request.content.data;
    
    if (data?.reminderId) {
      // Navigate to the filing reminders screen or specific reminder
      // This would be handled by your navigation system
      console.log('Navigate to reminder:', data.reminderId);
    }
  });
  
  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

// Utility function to test notifications
export async function sendTestNotification(): Promise<void> {
  try {
    const permissions = await requestNotificationPermissions();
    if (!permissions.granted) {
      throw new Error('Notification permissions not granted');
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'GST Reminder Test',
        body: 'This is a test notification for GST filing reminders.',
        data: { test: true },
        sound: 'default',
      },
      trigger: {
        seconds: 2,
        channelId: 'gst-reminders',
      },
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
}

// Function to reschedule all reminders (useful when settings change)
export async function rescheduleAllReminders(reminders: FilingReminder[]): Promise<void> {
  try {
    // Cancel all existing GST notifications
    await cancelAllGSTNotifications();
    
    // Schedule new notifications for all active reminders
    for (const reminder of reminders) {
      if (!reminder.isCompleted) {
        const notificationIds = await scheduleFilingReminder(reminder);
        reminder.notificationIds = notificationIds;
      }
    }
  } catch (error) {
    console.error('Error rescheduling all reminders:', error);
    throw error;
  }
}
