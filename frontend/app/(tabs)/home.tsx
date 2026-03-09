import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { Trip } from '../../src/types';
import { COLORS } from '../../src/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trips');
      const tripsData = response.data.trips || [];
      setTrips(tripsData);

      // Calculate stats
      const pending = tripsData.filter((t: Trip) => t.status === 'pending').length;
      const approved = tripsData.filter((t: Trip) => t.status === 'approved').length;
      const rejected = tripsData.filter((t: Trip) => t.status === 'rejected').length;
      setStats({ pending, approved, rejected });
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recargar cuando la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.pending;
      case 'approved':
        return COLORS.approved;
      case 'rejected':
        return COLORS.rejected;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadData} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name}!</Text>
          <Text style={styles.subtitle}>Bienvenido de nuevo</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: COLORS.pending }]}>
          <Ionicons name="time-outline" size={24} color={COLORS.pending} />
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.approved }]}>
          <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.approved} />
          <Text style={styles.statNumber}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Aprobados</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.rejected }]}>
          <Ionicons name="close-circle-outline" size={24} color={COLORS.rejected} />
          <Text style={styles.statNumber}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Rechazados</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Viajes Recientes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/trips')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {trips.slice(0, 5).map((trip) => (
          <TouchableOpacity
            key={trip.trip_id}
            style={styles.tripCard}
            onPress={() => router.push(`/trip/${trip.trip_id}`)}
          >
            <View style={styles.tripHeader}>
              <Text style={styles.tripName}>{trip.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(trip.status) + '20' },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: getStatusColor(trip.status) }]}
                >
                  {getStatusText(trip.status)}
                </Text>
              </View>
            </View>
            <View style={styles.tripInfo}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.tripDate}>
                {new Date(trip.created_at).toLocaleDateString('es-ES')}
              </Text>
            </View>
            <View style={styles.tripInfo}>
              <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.tripDate}>
                {trip.participants.length} participante(s)
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {trips.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No tienes viajes aún</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(tabs)/create-trip')}
            >
              <Text style={styles.createButtonText}>Crear Viaje</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.headerDark,
    padding: 24,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.primaryLight,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tripCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tripDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
