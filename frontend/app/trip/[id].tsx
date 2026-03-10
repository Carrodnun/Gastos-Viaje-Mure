import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

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
      const msg = 'No se pudo cargar el viaje';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const handleAddExpense = () => {
    if (trip?.status !== 'approved') {
      const msg = 'Solo puedes añadir gastos a viajes aprobados';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Viaje no aprobado', msg);
      }
      return;
    }
    router.push(`/expense/create?tripId=${id}`);
  };

  const handleCloseTrip = async () => {
    try {
      setCloseLoading(true);
      await api.post(`/api/trips/${id}/close`);
      setShowCloseModal(false);
      
      const msg = 'Viaje cerrado correctamente';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Éxito', msg);
      }
      
      loadData();
    } catch (error: any) {
      console.error('Error closing trip:', error);
      const errorMsg = error.response?.data?.detail || 'Error al cerrar el viaje';
      if (Platform.OS === 'web') {
        window.alert('Error: ' + errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setCloseLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      const baseUrl = api.defaults.baseURL || '';
      const exportUrl = `${baseUrl}/api/trips/${id}/export/excel`;
      
      if (Platform.OS === 'web') {
        // On web, trigger download via a hidden link
        const response = await api.get(`/api/trips/${id}/export/excel`, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gastos_${trip?.name?.replace(/\s/g, '_') || 'viaje'}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        window.alert('Excel descargado correctamente');
      } else {
        // On mobile, open in browser
        await Linking.openURL(exportUrl);
      }
    } catch (error: any) {
      console.error('Error exporting:', error);
      const errorMsg = error.response?.data?.detail || 'Error al exportar';
      if (Platform.OS === 'web') {
        window.alert('Error: ' + errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/api/trips/${id}`);
      setShowDeleteModal(false);
      
      const msg = 'Viaje eliminado correctamente';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Éxito', msg);
      }
      
      router.back();
    } catch (error: any) {
      console.error('Error deleting trip:', error);
      const errorMsg = error.response?.data?.detail || 'Error al eliminar el viaje';
      if (Platform.OS === 'web') {
        window.alert('Error: ' + errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const canDeleteTrip = () => {
    if (!trip || !currentUser) return false;
    return trip.creator_id === currentUser.user_id || currentUser.role === 'admin';
  };

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
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            {canDeleteTrip() && (
              <TouchableOpacity
                style={styles.deleteHeaderButton}
                onPress={() => setShowDeleteModal(true)}
              >
                <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
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

        {/* Botón grande para añadir gasto si está aprobado */}
        {trip.status === 'approved' && (
          <TouchableOpacity style={styles.addExpenseBigButton} onPress={handleAddExpense}>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.addExpenseBigButtonText}>Añadir Nuevo Gasto</Text>
          </TouchableOpacity>
        )}

        {/* Botón para cerrar viaje cuando está aprobado */}
        {trip.status === 'approved' && (
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowCloseModal(true)}
          >
            <Ionicons name="lock-closed" size={20} color={COLORS.info || '#5856D6'} />
            <Text style={styles.closeButtonText}>Cerrar Viaje</Text>
          </TouchableOpacity>
        )}

        {/* Botón para exportar Excel cuando está cerrado */}
        {trip.status === 'closed' && (
          <TouchableOpacity 
            style={styles.exportButton} 
            onPress={handleExportExcel}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="download" size={20} color="#FFFFFF" />
                <Text style={styles.exportButtonText}>Exportar a Excel</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {trip.status === 'closed' && (
          <View style={styles.closedInfoCard}>
            <Ionicons name="lock-closed" size={24} color={COLORS.info || '#5856D6'} />
            <Text style={styles.closedInfoText}>
              Este viaje está cerrado. No se pueden añadir más gastos.
            </Text>
          </View>
        )}

        {trip.status !== 'approved' && trip.status !== 'closed' && (
          <View style={styles.warningCard}>
            <Ionicons name="information-circle" size={24} color={COLORS.warning} />
            <Text style={styles.warningText}>
              {trip.status === 'pending' 
                ? 'Este viaje está pendiente de aprobación. No puedes añadir gastos hasta que sea aprobado.'
                : 'Este viaje fue rechazado. No puedes añadir gastos.'}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gastos Registrados</Text>
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
            </View>
          )}
        </View>

        {/* Botón para eliminar viaje al final */}
        {canDeleteTrip() && (
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.deleteButtonText}>Eliminar Viaje</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {trip.status === 'approved' && (
        <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Modal de confirmación para cerrar viaje */}
      <Modal visible={showCloseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="lock-closed" size={48} color={COLORS.info || '#5856D6'} />
            </View>
            <Text style={styles.modalTitle}>Cerrar Viaje</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro que deseas cerrar "{trip.name}"?
            </Text>
            <Text style={styles.modalWarning}>
              Una vez cerrado, no se podrán añadir más gastos. Podrás exportar el viaje a Excel.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowCloseModal(false)}
                disabled={closeLoading}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.info || '#5856D6' }]}
                onPress={handleCloseTrip}
                disabled={closeLoading}
              >
                {closeLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalDeleteText}>Cerrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="warning" size={48} color={COLORS.error} />
            </View>
            <Text style={styles.modalTitle}>Eliminar Viaje</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro que deseas eliminar "{trip.name}"?
            </Text>
            <Text style={styles.modalWarning}>
              Se eliminarán también todos los gastos asociados. Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={handleDeleteTrip}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalDeleteText}>Eliminar</Text>
                )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.headerDark,
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
  },
  deleteHeaderButton: {
    padding: 4,
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
  addExpenseBigButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addExpenseBigButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: COLORS.info || '#5856D6',
    borderRadius: 12,
    backgroundColor: '#F0EFFE',
  },
  closeButtonText: {
    color: COLORS.info || '#5856D6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closedInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  closedInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#5B21B6',
    marginLeft: 12,
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
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalWarning: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
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
  modalDeleteButton: {
    backgroundColor: COLORS.error,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
