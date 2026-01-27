import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { CostCenter, User } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS } from '../../src/constants/colors';

export default function CreateTripScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [name, setName] = useState('');
  const [costCenterId, setCostCenterId] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCostCenterModal, setShowCostCenterModal] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [centersRes, usersRes] = await Promise.all([
        api.get('/api/admin/cost-centers'),
        api.get('/api/admin/users'),
      ]);
      setCostCenters(centersRes.data.cost_centers.filter((c: CostCenter) => c.active));
      setUsers(usersRes.data.users.filter((u: User) => u.user_id !== currentUser?.user_id));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el viaje');
      return;
    }

    if (!costCenterId) {
      Alert.alert('Error', 'Por favor selecciona un centro de coste');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/trips', {
        name: name.trim(),
        cost_center_id: costCenterId,
        participants: selectedParticipants,
      });

      Alert.alert('Éxito', 'Viaje creado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            setName('');
            setCostCenterId('');
            setSelectedParticipants([]);
            router.push(`/trip/${response.data.trip_id}`);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Error al crear el viaje'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectedCostCenter = costCenters.find((c) => c.center_id === costCenterId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Nombre del Viaje *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Viaje a Madrid"
            value={name}
            onChangeText={setName}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Centro de Coste *</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowCostCenterModal(true)}
          >
            <Text style={selectedCostCenter ? styles.pickerText : styles.pickerPlaceholder}>
              {selectedCostCenter ? selectedCostCenter.name : 'Seleccionar centro de coste'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Participantes</Text>
            <TouchableOpacity onPress={() => setShowUserPicker(!showUserPicker)}>
              <Ionicons
                name={showUserPicker ? 'chevron-up-circle' : 'add-circle'}
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>Tú estás incluido automáticamente</Text>

          {showUserPicker && (
            <View style={styles.pickerOptions}>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {users.map((user) => (
                  <TouchableOpacity
                    key={user.user_id}
                    style={styles.userOption}
                    onPress={() => toggleParticipant(user.user_id)}
                  >
                    <View style={styles.userInfo}>
                      <View
                        style={[
                          styles.checkbox,
                          selectedParticipants.includes(user.user_id) && styles.checkboxChecked,
                        ]}
                      >
                        {selectedParticipants.includes(user.user_id) && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedParticipants.length > 0 && (
            <View style={styles.selectedUsers}>
              {users
                .filter((u) => selectedParticipants.includes(u.user_id))
                .map((user) => (
                  <View key={user.user_id} style={styles.selectedUserChip}>
                    <Text style={styles.selectedUserText}>{user.name}</Text>
                    <TouchableOpacity onPress={() => toggleParticipant(user.user_id)}>
                      <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creando...' : 'Crear Viaje'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para seleccionar centro de coste */}
      <Modal visible={showCostCenterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Centro de Coste</Text>
              <TouchableOpacity onPress={() => setShowCostCenterModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {costCenters.map((center) => (
                <TouchableOpacity
                  key={center.center_id}
                  style={[
                    styles.modalOption,
                    costCenterId === center.center_id && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setCostCenterId(center.center_id);
                    setShowCostCenterModal(false);
                  }}
                >
                  <View style={styles.modalOptionContent}>
                    <Text style={[
                      styles.modalOptionText,
                      costCenterId === center.center_id && styles.modalOptionTextSelected,
                    ]}>
                      {center.name}
                    </Text>
                    <Text style={styles.modalOptionSubtext}>{center.code}</Text>
                  </View>
                  {costCenterId === center.center_id && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  picker: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.text,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  pickerOptions: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  userOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  selectedUsers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedUserText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalScroll: {
    padding: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  modalOptionSelected: {
    backgroundColor: COLORS.primaryBackground,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  modalOptionTextSelected: {
    color: COLORS.primary,
  },
  modalOptionSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
