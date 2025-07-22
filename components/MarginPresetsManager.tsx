import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { Plus, Edit3, Trash2, Save, X, Star, Building, Users } from 'lucide-react-native';
import {
  MarginPreset,
  DEFAULT_MARGIN_PRESETS,
} from '../utils/profitMarginCalculations';
import {
  getMarginPresets,
  addMarginPreset,
  deleteMarginPreset,
  saveMarginPresets,
} from '../utils/profitMarginStorage';

interface MarginPresetsManagerProps {
  onPresetSelect?: (preset: MarginPreset) => void;
  selectedBusinessType?: 'B2B' | 'B2C';
}

export default function MarginPresetsManager({
  onPresetSelect,
  selectedBusinessType,
}: MarginPresetsManagerProps) {
  const [presets, setPresets] = useState<MarginPreset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<MarginPreset | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [presetName, setPresetName] = useState('');
  const [marginPercent, setMarginPercent] = useState('');
  const [businessType, setBusinessType] = useState<'B2B' | 'B2C'>('B2C');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadPresets();
  }, []);

  useEffect(() => {
    if (selectedBusinessType) {
      setBusinessType(selectedBusinessType);
    }
  }, [selectedBusinessType]);

  const loadPresets = async () => {
    try {
      setLoading(true);
      const loadedPresets = await getMarginPresets();
      setPresets(loadedPresets);
    } catch (error) {
      console.error('Error loading presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPresetName('');
    setMarginPercent('');
    setDescription('');
    setBusinessType(selectedBusinessType || 'B2C');
    setEditingPreset(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (preset: MarginPreset) => {
    setPresetName(preset.name);
    setMarginPercent(preset.marginPercent.toString());
    setBusinessType(preset.businessType);
    setDescription(preset.description || '');
    setEditingPreset(preset);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleSavePreset = async () => {
    try {
      if (!presetName.trim()) {
        Alert.alert('Invalid Input', 'Please enter a preset name');
        return;
      }

      const margin = parseFloat(marginPercent);
      if (isNaN(margin) || margin < 0) {
        Alert.alert('Invalid Input', 'Please enter a valid margin percentage');
        return;
      }

      const preset: MarginPreset = {
        id: editingPreset?.id || `preset_${Date.now()}`,
        name: presetName.trim(),
        marginPercent: margin,
        businessType,
        description: description.trim() || undefined,
        isDefault: editingPreset?.isDefault || false,
      };

      await addMarginPreset(preset);
      await loadPresets();
      closeModal();

      Alert.alert('Success', `Preset ${editingPreset ? 'updated' : 'saved'} successfully!`);
    } catch (error) {
      Alert.alert('Error', `Failed to ${editingPreset ? 'update' : 'save'} preset`);
    }
  };

  const handleDeletePreset = (preset: MarginPreset) => {
    if (preset.isDefault) {
      Alert.alert('Cannot Delete', 'Default presets cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Preset',
      `Are you sure you want to delete "${preset.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMarginPreset(preset.id);
              await loadPresets();
              Alert.alert('Success', 'Preset deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete preset');
            }
          },
        },
      ]
    );
  };

  const handlePresetSelect = (preset: MarginPreset) => {
    if (onPresetSelect) {
      onPresetSelect(preset);
    }
  };

  const getFilteredPresets = () => {
    if (selectedBusinessType) {
      return presets.filter(preset => preset.businessType === selectedBusinessType);
    }
    return presets;
  };

  const renderPresetCard = (preset: MarginPreset) => (
    <View key={preset.id} style={styles.presetCard}>
      <TouchableOpacity
        style={styles.presetContent}
        onPress={() => handlePresetSelect(preset)}
      >
        <View style={styles.presetHeader}>
          <View style={styles.presetInfo}>
            <Text style={styles.presetName}>{preset.name}</Text>
            <View style={styles.presetMeta}>
              {preset.businessType === 'B2B' ? (
                <Building size={12} color="#666666" />
              ) : (
                <Users size={12} color="#666666" />
              )}
              <Text style={styles.presetBusinessType}>{preset.businessType}</Text>
              {preset.isDefault && (
                <>
                  <Star size={12} color="#FFD700" />
                  <Text style={styles.defaultLabel}>Default</Text>
                </>
              )}
            </View>
          </View>
          
          <View style={styles.presetMargin}>
            <Text style={styles.marginValue}>{preset.marginPercent}%</Text>
          </View>
        </View>

        {preset.description && (
          <Text style={styles.presetDescription}>{preset.description}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.presetActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(preset)}
        >
          <Edit3 size={16} color="#1A237E" />
        </TouchableOpacity>
        
        {!preset.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeletePreset(preset)}
          >
            <Trash2 size={16} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closeModal}>
            <X size={24} color="#666666" />
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>
            {editingPreset ? 'Edit Preset' : 'Add New Preset'}
          </Text>
          
          <TouchableOpacity onPress={handleSavePreset}>
            <Save size={24} color="#1A237E" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Preset Name</Text>
            <TextInput
              style={styles.formInput}
              value={presetName}
              onChangeText={setPresetName}
              placeholder="Enter preset name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Margin Percentage</Text>
            <TextInput
              style={styles.formInput}
              value={marginPercent}
              onChangeText={setMarginPercent}
              placeholder="Enter margin percentage"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Business Type</Text>
            <View style={styles.businessTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.businessTypeOption,
                  businessType === 'B2B' && styles.businessTypeOptionActive,
                ]}
                onPress={() => setBusinessType('B2B')}
              >
                <Building size={16} color={businessType === 'B2B' ? '#FFFFFF' : '#1A237E'} />
                <Text
                  style={[
                    styles.businessTypeText,
                    businessType === 'B2B' && styles.businessTypeTextActive,
                  ]}
                >
                  B2B
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.businessTypeOption,
                  businessType === 'B2C' && styles.businessTypeOptionActive,
                ]}
                onPress={() => setBusinessType('B2C')}
              >
                <Users size={16} color={businessType === 'B2C' ? '#FFFFFF' : '#1A237E'} />
                <Text
                  style={[
                    styles.businessTypeText,
                    businessType === 'B2C' && styles.businessTypeTextActive,
                  ]}
                >
                  B2C
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading presets...</Text>
      </View>
    );
  }

  const filteredPresets = getFilteredPresets();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Margin Presets</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.presetsList} showsVerticalScrollIndicator={false}>
        {filteredPresets.length > 0 ? (
          filteredPresets.map(renderPresetCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No presets found</Text>
            <Text style={styles.emptySubtitle}>
              Create your first margin preset to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {renderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A237E',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  presetsList: {
    flex: 1,
    padding: 16,
  },
  presetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  presetContent: {
    padding: 16,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  presetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetBusinessType: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    marginRight: 8,
  },
  defaultLabel: {
    fontSize: 12,
    color: '#FFD700',
    marginLeft: 4,
  },
  presetMargin: {
    alignItems: 'center',
  },
  marginValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A237E',
  },
  presetDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  presetActions: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  businessTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  businessTypeOption: {
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
  businessTypeOptionActive: {
    backgroundColor: '#1A237E',
    borderColor: '#1A237E',
  },
  businessTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A237E',
    marginLeft: 6,
  },
  businessTypeTextActive: {
    color: '#FFFFFF',
  },
});
