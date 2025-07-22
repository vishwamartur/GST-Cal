import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Bell, CheckCircle, AlertCircle, Clock } from 'lucide-react-native';
import { FilingDate, getUpcomingFilingDates } from '../utils/gstFilingDates';
import { FilingReminder, getReminderSettings, getActiveReminders } from '../utils/reminderStorage';

interface GSTCalendarProps {
  onDateSelect?: (date: string, filings: FilingDate[]) => void;
  onReminderToggle?: (filing: FilingDate, enabled: boolean) => void;
}

interface MarkedDates {
  [key: string]: {
    marked?: boolean;
    dotColor?: string;
    selectedColor?: string;
    selected?: boolean;
    customStyles?: {
      container?: object;
      text?: object;
    };
  };
}

export default function GSTCalendar({ onDateSelect, onReminderToggle }: GSTCalendarProps) {
  const [filingDates, setFilingDates] = useState<FilingDate[]>([]);
  const [activeReminders, setActiveReminders] = useState<FilingReminder[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilingDates();
    loadActiveReminders();
  }, []);

  useEffect(() => {
    updateMarkedDates();
  }, [filingDates, activeReminders, selectedDate]);

  const loadFilingDates = async () => {
    try {
      const settings = await getReminderSettings();
      const dates = getUpcomingFilingDates(
        settings.businessType,
        settings.annualTurnover,
        365 // Get dates for next year
      );
      setFilingDates(dates);
    } catch (error) {
      console.error('Error loading filing dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveReminders = async () => {
    try {
      const reminders = await getActiveReminders();
      setActiveReminders(reminders);
    } catch (error) {
      console.error('Error loading active reminders:', error);
    }
  };

  const updateMarkedDates = () => {
    const marked: MarkedDates = {};

    // Mark filing dates
    filingDates.forEach(filing => {
      const dateKey = filing.dueDate.toISOString().split('T')[0];
      const hasReminder = activeReminders.some(r => 
        r.id === filing.id && !r.isCompleted
      );
      const isCompleted = activeReminders.some(r => 
        r.id === filing.id && r.isCompleted
      );

      marked[dateKey] = {
        marked: true,
        dotColor: isCompleted ? '#4CAF50' : filing.isOverdue ? '#F44336' : '#1A237E',
        selectedColor: selectedDate === dateKey ? '#1A237E' : undefined,
        selected: selectedDate === dateKey,
        customStyles: {
          container: {
            backgroundColor: selectedDate === dateKey ? '#1A237E' : 'transparent',
            borderRadius: 16,
          },
          text: {
            color: selectedDate === dateKey ? '#FFFFFF' : 
                   isCompleted ? '#4CAF50' : 
                   filing.isOverdue ? '#F44336' : '#000000',
            fontWeight: hasReminder ? 'bold' : 'normal',
          },
        },
      };
    });

    setMarkedDates(marked);
  };

  const handleDayPress = (day: DateData) => {
    const dateKey = day.dateString;
    setSelectedDate(dateKey);
    
    const dayFilings = filingDates.filter(filing => 
      filing.dueDate.toISOString().split('T')[0] === dateKey
    );
    
    if (onDateSelect) {
      onDateSelect(dateKey, dayFilings);
    }
  };

  const getSelectedDateFilings = () => {
    if (!selectedDate) return [];
    return filingDates.filter(filing => 
      filing.dueDate.toISOString().split('T')[0] === selectedDate
    );
  };

  const toggleReminder = (filing: FilingDate) => {
    const hasReminder = activeReminders.some(r => 
      r.id === filing.id && !r.isCompleted
    );
    
    if (onReminderToggle) {
      onReminderToggle(filing, !hasReminder);
    }
  };

  const getStatusIcon = (filing: FilingDate) => {
    const reminder = activeReminders.find(r => r.id === filing.id);
    
    if (reminder?.isCompleted) {
      return <CheckCircle size={16} color="#4CAF50" />;
    } else if (filing.isOverdue) {
      return <AlertCircle size={16} color="#F44336" />;
    } else if (reminder && !reminder.isCompleted) {
      return <Bell size={16} color="#1A237E" />;
    } else {
      return <Clock size={16} color="#9E9E9E" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: '#FFFFFF',
          calendarBackground: '#FFFFFF',
          textSectionTitleColor: '#1A237E',
          selectedDayBackgroundColor: '#1A237E',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#1A237E',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#1A237E',
          selectedDotColor: '#FFFFFF',
          arrowColor: '#1A237E',
          monthTextColor: '#1A237E',
          indicatorColor: '#1A237E',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        markingType="custom"
        hideExtraDays={true}
        firstDay={1} // Monday as first day
      />

      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateTitle}>
            {new Date(selectedDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          
          <ScrollView style={styles.filingsContainer}>
            {getSelectedDateFilings().length > 0 ? (
              getSelectedDateFilings().map((filing) => (
                <View key={filing.id} style={styles.filingItem}>
                  <View style={styles.filingHeader}>
                    <View style={styles.filingInfo}>
                      {getStatusIcon(filing)}
                      <View style={styles.filingDetails}>
                        <Text style={styles.filingName}>{filing.returnName}</Text>
                        <Text style={styles.filingPeriod}>{filing.period}</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.reminderButton,
                        activeReminders.some(r => r.id === filing.id && !r.isCompleted) && 
                        styles.reminderButtonActive
                      ]}
                      onPress={() => toggleReminder(filing)}
                    >
                      <Bell 
                        size={16} 
                        color={
                          activeReminders.some(r => r.id === filing.id && !r.isCompleted) 
                            ? '#FFFFFF' 
                            : '#1A237E'
                        } 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.filingStatus}>
                    <Text style={[
                      styles.statusText,
                      filing.isOverdue && styles.overdueText,
                      activeReminders.some(r => r.id === filing.id && r.isCompleted) && 
                      styles.completedText
                    ]}>
                      {activeReminders.some(r => r.id === filing.id && r.isCompleted) 
                        ? 'Completed' 
                        : filing.isOverdue 
                          ? `Overdue by ${Math.abs(filing.daysUntilDue)} days`
                          : `Due in ${filing.daysUntilDue} days`
                      }
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noFilingsText}>No GST filings due on this date</Text>
            )}
          </ScrollView>
        </View>
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
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedDateContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 16,
  },
  filingsContainer: {
    flex: 1,
  },
  filingItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1A237E',
  },
  filingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filingDetails: {
    marginLeft: 8,
    flex: 1,
  },
  filingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  filingPeriod: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  reminderButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1A237E',
    backgroundColor: '#FFFFFF',
  },
  reminderButtonActive: {
    backgroundColor: '#1A237E',
  },
  filingStatus: {
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666666',
  },
  overdueText: {
    color: '#F44336',
    fontWeight: '600',
  },
  completedText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  noFilingsText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
    marginTop: 32,
  },
});
