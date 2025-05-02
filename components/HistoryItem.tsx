import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Share } from 'react-native';
import { Share2 } from 'lucide-react-native';

interface HistoryItemProps {
  item: {
    timestamp: string;
    description: string;
    amount: number;
    isInclusive: boolean;
    gstRate: number;
    netAmount: number;
    gstAmount: number;
    grossAmount: number;
  };
}

export default function HistoryItem({ item }: HistoryItemProps) {
  const formatCurrency = (value: number) => {
    return `₹${value.toFixed(2)}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    try {
      const message = 
        `GST Calculation for ${item.description}\n\n` +
        `Amount: ₹${item.amount.toFixed(2)}\n` +
        `GST Rate: ${item.gstRate}%\n` +
        `Calculation Type: ${item.isInclusive ? 'Inclusive' : 'Exclusive'}\n\n` +
        `Net Amount: ₹${item.netAmount.toFixed(2)}\n` +
        `GST Amount: ₹${item.gstAmount.toFixed(2)}\n` +
        `Gross Amount: ₹${item.grossAmount.toFixed(2)}`;

      await Share.share({
        message,
        title: 'GST Calculation Result',
      });
    } catch (error) {
      console.error('Error sharing result:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.description}>{item.description}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Share2 size={16} color="#1A237E" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.calcType}>
          {item.isInclusive ? 'Inclusive' : 'Exclusive'} • {item.gstRate}% GST
        </Text>
      </View>
      
      <View style={styles.amountRow}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Net</Text>
          <Text style={styles.amountValue}>{formatCurrency(item.netAmount)}</Text>
        </View>
        
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>GST</Text>
          <Text style={styles.amountValue}>{formatCurrency(item.gstAmount)}</Text>
        </View>
        
        <View style={styles.amountItem}>
          <Text style={styles.totalLabel}>Gross</Text>
          <Text style={styles.totalValue}>{formatCurrency(item.grossAmount)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  shareButton: {
    padding: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: '#757575',
  },
  calcType: {
    fontSize: 12,
    color: '#1A237E',
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F7',
    paddingTop: 12,
  },
  amountItem: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
  totalLabel: {
    fontSize: 12,
    color: '#1A237E',
    marginBottom: 4,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A237E',
  },
});