import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { Trip } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS } from '../../src/constants/colors';

export default function ApprovalsScreen() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trips/pending');
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Error loading pending trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleApprove = async (tripId: string) => {
    Alert.alert(
      'Aprobar Viaje',
      '¿Estás seguro que deseas aprobar este viaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          onPress: async () => {
            try {
              await api.post(`/api/trips/${tripId}/approve`);
              Alert.alert('Éxito', 'Viaje aprobado correctamente');
              loadTrips();
            } catch (error: any) {
              console.error('Error approving trip:', error);
              Alert.alert('Error', error.response?.data?.detail || 'Error al aprobar el viaje');
            }
          },
        },
      ]
    );
  };

  const openRejectModal = (tripId: string) => {
    setSelectedTripId(tripId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedTripId) return;

    try {
      await api.post(`/api/trips/${selectedTripId}/reject`, { reason: rejectReason || null });
      Alert.alert('Éxito', 'Viaje rechazado');
      setShowRejectModal(false);
      setSelectedTripId(null);
      setRejectReason('');
      loadTrips();
    } catch (error: any) {
      console.error('Error rejecting trip:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Error al rechazar el viaje');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTrips} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Viajes Pendientes de Aprobación</Text>
          <Text style={styles.headerSubtitle}>
            {trips.length} {trips.length === 1 ? 'viaje' : 'viajes'}
          </Text>
        </View>

        {trips.map((trip) => (
          <View key={trip.trip_id} style={styles.tripCard}>
            <View style={styles.tripHeader}>
              <Ionicons name="airplane" size={24} color={COLORS.primary} />
              <Text style={styles.tripName}>{trip.name}</Text>
            </View>
            <View style={styles.tripInfo}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.tripInfoText}>
                {new Date(trip.created_at).toLocaleDateString('es-ES')}
              </Text>
            </View>
            <View style={styles.tripInfo}>
              <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.tripInfoText}>
                {trip.participants.length} participante(s)
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => openRejectModal(trip.trip_id)}
              >
                <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.approveButton]}
                onPress={() => handleApprove(trip.trip_id)}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Aprobar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {trips.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No hay viajes pendientes</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal para rechazar viaje */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rechazar Viaje</Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Motivo del rechazo (opcional):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ingresa el motivo..."
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.textMuted}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalRejectButton]}
                onPress={handleReject}
              >
                <Text style={styles.modalRejectText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.card,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tripCard: {
    backgroundColor: COLORS.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
    flex: 1,
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  tripInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalRejectButton: {
    backgroundColor: COLORS.error,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalRejectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
