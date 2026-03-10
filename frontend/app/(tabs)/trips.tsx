import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../src/utils/api';
import { Trip } from '../../src/types';
import { COLORS } from '../../src/constants/colors';

export default function TripsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trips');
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recargar viajes cuando la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  useEffect(() => {
    let filtered = trips;

    if (searchQuery) {
      filtered = filtered.filter((trip) =>
        trip.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((trip) => trip.status === filterStatus);
    }

    setFilteredTrips(filtered);
  }, [searchQuery, filterStatus, trips]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.pending;
      case 'approved':
        return COLORS.approved;
      case 'rejected':
        return COLORS.rejected;
      case 'closed':
        return COLORS.info || '#5856D6';
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
      case 'closed':
        return 'Cerrado';
      default:
        return status;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar viajes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !filterStatus && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus(null)}
          >
            <Text
              style={[
                styles.filterText,
                !filterStatus && styles.filterTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterStatus === 'pending' && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus('pending')}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'pending' && styles.filterTextActive,
              ]}
            >
              Pendientes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterStatus === 'approved' && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus('approved')}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'approved' && styles.filterTextActive,
              ]}
            >
              Aprobados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterStatus === 'rejected' && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus('rejected')}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'rejected' && styles.filterTextActive,
              ]}
            >
              Rechazados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterStatus === 'closed' && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus('closed')}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'closed' && styles.filterTextActive,
              ]}
            >
              Cerrados
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTrips} />
        }
      >
        {filteredTrips.map((trip) => (
          <TouchableOpacity
            key={trip.trip_id}
            style={styles.tripCard}
            onPress={() => router.push(`/trip/${trip.trip_id}`)}
          >
            <View style={styles.tripHeader}>
              <View style={styles.tripTitleContainer}>
                <Ionicons name="airplane" size={20} color={COLORS.primary} />
                <Text style={styles.tripName}>{trip.name}</Text>
              </View>
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
          </TouchableOpacity>
        ))}

        {filteredTrips.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>
              {searchQuery || filterStatus
                ? 'No se encontraron viajes'
                : 'No tienes viajes aún'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
    padding: 16,
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
    marginBottom: 12,
  },
  tripTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
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
  tripInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
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
});
