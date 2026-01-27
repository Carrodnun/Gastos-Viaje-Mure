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
import { Trip, Expense, User, CostCenter } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS } from '../../src/constants/colors';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [costCenters, setCostCenters] = useState<Record<string, CostCenter>>({});
  const [loading, setLoading] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripRes, expensesRes, usersRes, centersRes] = await Promise.all([
        api.get(`/api/trips/${id}`),
        api.get(`/api/expenses/trip/${id}`),
        api.get('/api/admin/users'),
        api.get('/api/admin/cost-centers'),
      ]);

      setTrip(tripRes.data);
      setExpenses(expensesRes.data.expenses || []);

      // Create user lookup
      const userMap: Record<string, User> = {};
      usersRes.data.users.forEach((u: User) => {
        userMap[u.user_id] = u;
      });
      setUsers(userMap);

      // Create cost center lookup
      const centerMap: Record<string, CostCenter> = {};
      centersRes.data.cost_centers.forEach((c: CostCenter) => {
        centerMap[c.center_id] = c;
      });
      setCostCenters(centerMap);
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

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (!trip) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const costCenter = costCenters[trip.cost_center_id];

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
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              Creado: {new Date(trip.created_at).toLocaleDateString('es-ES')}
            </Text>
          </View>
          {costCenter && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>
                Centro de Coste: {costCenter.name} ({costCenter.code})
              </Text>
            </View>
          )}
          
          {/* Sección de Participantes */}
          <TouchableOpacity 
            style={styles.participantsHeader}
            onPress={() => setShowParticipants(!showParticipants)}
          >
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>
                {trip.participants.length} participante(s)
              </Text>
            </View>
            <Ionicons 
              name={showParticipants ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={COLORS.textSecondary} 
            />
          </TouchableOpacity>

          {showParticipants && (
            <View style={styles.participantsList}>
              {trip.participants.map((participantId) => {
                const participant = users[participantId];
                const isCreator = participantId === trip.creator_id;
                return (
                  <View key={participantId} style={styles.participantItem}>
                    <Ionicons 
                      name="person-circle" 
                      size={32} 
                      color={COLORS.primary} 
                    />
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {participant?.name || 'Usuario'}
                        {isCreator && ' (Creador)'}
                      </Text>
                      <Text style={styles.participantEmail}>
                        {participant?.email || ''}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {trip.status === 'approved' && trip.approved_by && (
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
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
                <Ionicons name="add-circle" size={28} color={COLORS.primary} />
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
                  <Ionicons name="image" size={16} color={COLORS.success} />
                )}
              </View>
            </TouchableOpacity>
          ))}

          {expenses.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>
                {trip.status === 'approved'
                  ? 'No hay gastos aún. ¡Añade el primero!'
                  : 'Este viaje aún no tiene gastos'}
              </Text>
              {trip.status === 'approved' && (
                <TouchableOpacity style={styles.addExpenseButton} onPress={handleAddExpense}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addExpenseButtonText}>Añadir Gasto</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {trip.status === 'approved' && expenses.length > 0 && (
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsList: {
    marginTop: 8,
    marginLeft: 28,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  participantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  participantEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
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
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
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
  expenseCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    color: COLORS.text,
    marginBottom: 4,
  },
  expenseEstablishment: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  expenseDate: {
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  expenseDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseUser: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addExpenseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
