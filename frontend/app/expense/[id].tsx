import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { Expense, User, ExpenseCategory } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expenseRes, usersRes, categoriesRes] = await Promise.all([
        api.get(`/api/expenses/${id}`),
        api.get('/api/users'),
        api.get('/api/admin/expense-categories'),
      ]);

      const expenseData = expenseRes.data;
      setExpense(expenseData);

      const userData = usersRes.data.users.find(
        (u: User) => u.user_id === expenseData.user_id
      );
      setUser(userData);

      const categoryData = categoriesRes.data.categories.find(
        (c: ExpenseCategory) => c.category_id === expenseData.category_id
      );
      setCategory(categoryData);
    } catch (error: any) {
      console.error('Error loading expense:', error);
      Alert.alert('Error', 'No se pudo cargar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Gasto',
      '¿Estás seguro que deseas eliminar este gasto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/expenses/${id}`);
              Alert.alert('Éxito', 'Gasto eliminado', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Error al eliminar');
            }
          },
        },
      ]
    );
  };

  const canEdit =
    currentUser?.role === 'admin' ||
    (expense && expense.user_id === currentUser?.user_id);

  if (!expense) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Gasto</Text>
        {canEdit && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Monto</Text>
          <Text style={styles.amountValue}>€{expense.amount.toFixed(2)}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={24} color="#4F46E5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>
                {new Date(expense.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="business-outline" size={24} color="#4F46E5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Establecimiento</Text>
              <Text style={styles.infoValue}>{expense.establishment}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="pricetag-outline" size={24} color="#4F46E5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Categoría</Text>
              <Text style={styles.infoValue}>{category?.name || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={24} color="#4F46E5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Creado por</Text>
              <Text style={styles.infoValue}>{user?.name || 'Usuario'}</Text>
            </View>
          </View>

          {expense.notes && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="document-text-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Notas</Text>
                <Text style={styles.infoValue}>{expense.notes}</Text>
              </View>
            </View>
          )}
        </View>

        {expense.receipt_image && (
          <View style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>Ticket</Text>
            <Image
              source={{ uri: expense.receipt_image }}
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </View>
        )}

        <View style={styles.metadataCard}>
          <Text style={styles.metadataText}>
            Creado: {new Date(expense.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.metadataText}>
            Última modificación: {new Date(expense.modified_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </ScrollView>
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
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  amountCard: {
    backgroundColor: '#4F46E5',
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoCard: {
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  receiptCard: {
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
  receiptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  receiptImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
  metadataCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
  },
  metadataText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});
