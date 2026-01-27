import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { Trip } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';

export default function ApprovalsScreen() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

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
              Alert.alert('Éxito', 'Viaje aprobado');
              loadTrips();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Error al aprobar');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (tripId: string) => {
    Alert.prompt(
      'Rechazar Viaje',
      'Motivo del rechazo (opcional):',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async (reason) => {
            try {
              await api.post(`/api/trips/${tripId}/reject`, { reason });
              Alert.alert('Éxito', 'Viaje rechazado');
              loadTrips();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Error al rechazar');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <ScrollView
      style={styles.container}
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
            <Ionicons name="airplane" size={24} color="#4F46E5" />
            <Text style={styles.tripName}>{trip.name}</Text>
          </View>
          <View style={styles.tripInfo}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.tripInfoText}>
              {new Date(trip.created_at).toLocaleDateString('es-ES')}
            </Text>
          </View>
          <View style={styles.tripInfo}>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text style={styles.tripInfoText}>
              {trip.participants.length} participante(s)
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => handleReject(trip.trip_id)}
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
          <Ionicons name="checkmark-done-circle-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No hay viajes pendientes</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
    color: '#6B7280',
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
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
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
    color: '#9CA3AF',
    marginTop: 16,
  },
});
