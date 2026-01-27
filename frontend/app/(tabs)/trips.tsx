import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { Trip } from '../../src/types';

export default function TripsScreen() {
  const router = useRouter();
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
      setFilteredTrips(response.data.trips || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

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
        return '#F59E0B';
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar viajes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
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
                <Ionicons name="airplane" size={20} color="#4F46E5" />
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
          </TouchableOpacity>
        ))}

        {filteredTrips.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={64} color="#D1D5DB" />
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
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    color: '#111827',
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
    color: '#6B7280',
    marginLeft: 6,
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
