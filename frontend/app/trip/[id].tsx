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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { Trip, Expense, User } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripRes, expensesRes, usersRes] = await Promise.all([
        api.get(`/api/trips/${id}`),
        api.get(`/api/expenses/trip/${id}`),
        api.get('/api/admin/users'),
      ]);

      setTrip(tripRes.data);
      setExpenses(expensesRes.data.expenses || []);

      // Create user lookup
      const userMap: Record<string, User> = {};
      usersRes.data.users.forEach((u: User) => {
        userMap[u.user_id] = u;
      });
      setUsers(userMap);
    } catch (error: any) {
      console.error('Error loading trip:', error);
      Alert.alert('Error', 'No se pudo cargar el viaje');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    if (trip?.status !== 'approved') {
      Alert.alert(
        'Viaje no aprobado',
        'Solo puedes añadir gastos a viajes aprobados'
      );
      return;
    }
    router.push(`/expense/create?tripId=${id}`);
  };

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

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (!trip) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.tripName}>{trip.name}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(trip.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusText(trip.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.infoText}>
              Creado: {new Date(trip.created_at).toLocaleDateString('es-ES')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color="#6B7280" />
            <Text style={styles.infoText}>
              {trip.participants.length} participante(s)
            </Text>
          </View>
          {trip.status === 'approved' && trip.approved_by && (
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
              <Text style={styles.infoText}>
                Aprobado por {users[trip.approved_by]?.name || 'Usuario'}
              </Text>
            </View>
          )}
          {trip.status === 'rejected' && trip.rejection_reason && (
            <View style={styles.rejectionCard}>
              <Text style={styles.rejectionText}>
                Motivo: {trip.rejection_reason}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Gastos</Text>
            <Text style={styles.statValue}>€{totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Número</Text>
            <Text style={styles.statValue}>{expenses.length}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gastos</Text>
            {trip.status === 'approved' && (
              <TouchableOpacity onPress={handleAddExpense}>
                <Ionicons name="add-circle" size={28} color="#4F46E5" />
              </TouchableOpacity>
            )}
          </View>

          {expenses.map((expense) => (
            <TouchableOpacity
              key={expense.expense_id}
              style={styles.expenseCard}
              onPress={() => router.push(`/expense/${expense.expense_id}`)}
            >
              <View style={styles.expenseHeader}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseAmount}>€{expense.amount.toFixed(2)}</Text>
                  <Text style={styles.expenseEstablishment}>
                    {expense.establishment}
                  </Text>
                </View>
                <View style={styles.expenseDate}>
                  <Text style={styles.expenseDateText}>
                    {new Date(expense.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
              </View>
              <View style={styles.expenseFooter}>
                <Text style={styles.expenseUser}>
                  {users[expense.user_id]?.name || 'Usuario'}
                </Text>
                {expense.receipt_image && (
                  <Ionicons name="image" size={16} color="#10B981" />
                )}
              </View>
            </TouchableOpacity>
          ))}

          {expenses.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {trip.status === 'approved'
                  ? 'No hay gastos aún. ¡Añade el primero!'
                  : 'Este viaje aún no tiene gastos'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {trip.status === 'approved' && (
        <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  rejectionCard: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  rejectionText: {
    fontSize: 14,
    color: '#991B1B',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
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
    color: '#111827',
  },
  expenseCard: {
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
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  expenseEstablishment: {
    fontSize: 14,
    color: '#6B7280',
  },
  expenseDate: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  expenseDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseUser: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
