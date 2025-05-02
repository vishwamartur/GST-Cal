import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { getCalculationHistory, clearHistory } from '@/utils/storage';
import { Trash2 } from 'lucide-react-native';
import HistoryItem from '@/components/HistoryItem';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getCalculationHistory();
      setHistory(data.reverse()); // Show newest first
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all calculation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
              setHistory([]); // Update local state immediately
              Alert.alert('Success', 'Calculation history has been cleared');
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear calculation history');
            }
          },
        },
      ]
    );
  };

  const renderEmptyHistory = () => (
    <Animated.View 
      entering={FadeInUp.duration(500)}
      style={styles.emptyContainer}
    >
      <Text style={styles.emptyText}>No calculation history yet</Text>
      <Text style={styles.emptySubtext}>
        Your GST calculations will appear here
      </Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {history.length > 0 && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Recent Calculations</Text>
          <TouchableOpacity
            onPress={handleClearHistory}
            style={styles.clearButton}
          >
            <Trash2 size={18} color="#FF5252" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={history}
        keyExtractor={(item) => item.timestamp}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 100).duration(500)}
            exiting={FadeOutDown.duration(300)}
          >
            <HistoryItem item={item} />
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyHistory}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButtonText: {
    marginLeft: 4,
    color: '#FF5252',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9E9E9E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});