import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { Trip } from '../../src/types';
import { COLORS, SHADOWS, DESIGN } from '../../src/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trips');
      const tripsData = response.data.trips || [];
      setTrips(tripsData);

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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.pending;
      case 'approved': return COLORS.approved;
      case 'rejected': return COLORS.rejected;
      case 'closed': return COLORS.info;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'closed': return 'Cerrado';
      default: return status;
    }
  };

  const StatCard = ({ icon, count, label, color, lightColor }: any) => (
    <View style={[styles.statCard, { borderColor: lightColor }]}>
      <View style={[styles.statIconContainer, { backgroundColor: lightColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statNumber}>{count}</Text>
      <Text style={[styles.statLabel, { color: color }]}>{label}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#E8F5EC', '#E8F0F8', '#F0EBF5']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={COLORS.primary} />
          }
        >
          {/* Header */}
          <LinearGradient
            colors={['#114D27', '#0D3D1F']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>Hola, {user?.name?.split(' ')[0]}!</Text>
                <Text style={styles.subtitle}>Bienvenido de nuevo</Text>
              </View>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarText}>
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Stats Cards - Con espacio adecuado */}
          <Animated.View style={[styles.statsSection, { opacity: fadeAnim }]}>
            <View style={styles.statsContainer}>
              <StatCard 
                icon="time-outline" 
                count={stats.pending} 
                label="Pendientes"
                color={COLORS.warning}
                lightColor={COLORS.warningLight}
              />
              <StatCard 
                icon="checkmark-circle-outline" 
                count={stats.approved} 
                label="Aprobados"
                color={COLORS.success}
                lightColor={COLORS.successLight}
              />
              <StatCard 
                icon="close-circle-outline" 
                count={stats.rejected} 
                label="Rechazados"
                color={COLORS.error}
                lightColor={COLORS.errorLight}
              />
            </View>
          </Animated.View>

          {/* Recent Trips Section */}
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>VIAJES RECIENTES</Text>
              <View style={styles.sectionLine} />
            </View>
            
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/(tabs)/trips')}
            >
              <Text style={styles.seeAllText}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>

            {trips.slice(0, 5).map((trip) => (
              <TouchableOpacity
                key={trip.trip_id}
                style={styles.tripCard}
                onPress={() => router.push(`/trip/${trip.trip_id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.tripHeader}>
                  <View style={styles.tripIconContainer}>
                    <Ionicons name="airplane" size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.tripInfo}>
                    <Text style={styles.tripName} numberOfLines={1}>{trip.name}</Text>
                    <View style={styles.tripMeta}>
                      <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.tripDate}>
                        {new Date(trip.created_at).toLocaleDateString('es-ES')}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(trip.status) + '15' },
                    ]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(trip.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
                      {getStatusText(trip.status)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {trips.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="airplane-outline" size={40} color={COLORS.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No tienes viajes aún</Text>
                <Text style={styles.emptyText}>Crea tu primer viaje para empezar</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.push('/(tabs)/create-trip')}
                >
                  <LinearGradient
                    colors={['#1B7A3E', '#22A050']}
                    style={styles.createButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Crear Viaje</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: DESIGN.borderRadius.xl,
    ...SHADOWS.colored('#114D27'),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textOnDarkMuted,
    marginTop: 2,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.glassBackground,
    padding: 14,
    borderRadius: DESIGN.borderRadius.large,
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.small,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginRight: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.separator,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tripCard: {
    backgroundColor: COLORS.glassBackground,
    padding: 14,
    borderRadius: DESIGN.borderRadius.large,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.small,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tripInfo: {
    flex: 1,
  },
  tripName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DESIGN.borderRadius.pill,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.glassBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...SHADOWS.small,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  createButton: {
    borderRadius: DESIGN.borderRadius.medium,
    overflow: 'hidden',
    ...SHADOWS.colored('#1B7A3E'),
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});
