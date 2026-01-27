import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { User, CostCenter, ExpenseCategory } from '../../src/types';
import { useRouter } from 'expo-router';

export default function AdminScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'centers' | 'categories'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterCode, setNewCenterCode] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'users') {
        const response = await api.get('/api/admin/users');
        setUsers(response.data.users || []);
      } else if (activeTab === 'centers') {
        const response = await api.get('/api/admin/cost-centers');
        setCostCenters(response.data.cost_centers || []);
      } else if (activeTab === 'categories') {
        const response = await api.get('/api/admin/expense-categories');
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserName) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/admin/users', {
        email: newUserEmail,
        name: newUserName,
        role: newUserRole,
      });
      Alert.alert('Éxito', 'Usuario creado');
      setShowModal(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRole('user');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCostCenter = async () => {
    if (!newCenterName || !newCenterCode) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/admin/cost-centers', {
        name: newCenterName,
        code: newCenterCode,
      });
      Alert.alert('Éxito', 'Centro de coste creado');
      setShowModal(false);
      setNewCenterName('');
      setNewCenterCode('');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Error al crear centro');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) {
      Alert.alert('Error', 'Por favor ingresa un nombre');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/admin/expense-categories', {
        name: newCategoryName,
      });
      Alert.alert('Éxito', 'Categoría creada');
      setShowModal(false);
      setNewCategoryName('');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Error al crear categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      Alert.alert(
        'Exportar',
        'La exportación a Excel se descargará automáticamente',
        [
          {
            text: 'OK',
            onPress: async () => {
              const response = await api.get('/api/admin/export/excel', {
                responseType: 'blob',
              });
              Alert.alert('Éxito', 'Archivo descargado');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Error al exportar');
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'approver':
        return 'Autorizador';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            Usuarios
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'centers' && styles.tabActive]}
          onPress={() => setActiveTab('centers')}
        >
          <Text style={[styles.tabText, activeTab === 'centers' && styles.tabTextActive]}>
            Centros
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
          onPress={() => setActiveTab('categories')}
        >
          <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>
            Categorías
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'users' && (
          <View>
            {users.map((user) => (
              <View key={user.user_id} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Ionicons name="person-circle" size={40} color="#4F46E5" />
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{user.name}</Text>
                    <Text style={styles.listItemSubtitle}>{user.email}</Text>
                  </View>
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{getRoleText(user.role)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'centers' && (
          <View>
            {costCenters.map((center) => (
              <View key={center.center_id} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Ionicons name="business" size={40} color="#4F46E5" />
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{center.name}</Text>
                    <Text style={styles.listItemSubtitle}>{center.code}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: center.active ? '#10B981' : '#EF4444' },
                  ]}
                />
              </View>
            ))}
          </View>
        )}

        {activeTab === 'categories' && (
          <View>
            {categories.map((category) => (
              <View key={category.category_id} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Ionicons name="pricetag" size={40} color="#4F46E5" />
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{category.name}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: category.active ? '#10B981' : '#EF4444' },
                  ]}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Ionicons name="download" size={20} color="#FFFFFF" />
          <Text style={styles.exportButtonText}>Exportar a Excel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeTab === 'users' && 'Nuevo Usuario'}
                {activeTab === 'centers' && 'Nuevo Centro de Coste'}
                {activeTab === 'categories' && 'Nueva Categoría'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {activeTab === 'users' && (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  value={newUserName}
                  onChangeText={setNewUserName}
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={newUserEmail}
                  onChangeText={setNewUserEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      newUserRole === 'user' && styles.roleOptionActive,
                    ]}
                    onPress={() => setNewUserRole('user')}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        newUserRole === 'user' && styles.roleOptionTextActive,
                      ]}
                    >
                      Usuario
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      newUserRole === 'approver' && styles.roleOptionActive,
                    ]}
                    onPress={() => setNewUserRole('approver')}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        newUserRole === 'approver' && styles.roleOptionTextActive,
                      ]}
                    >
                      Autorizador
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      newUserRole === 'admin' && styles.roleOptionActive,
                    ]}
                    onPress={() => setNewUserRole('admin')}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        newUserRole === 'admin' && styles.roleOptionTextActive,
                      ]}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateUser}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Creando...' : 'Crear Usuario'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'centers' && (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del Centro"
                  value={newCenterName}
                  onChangeText={setNewCenterName}
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Código"
                  value={newCenterCode}
                  onChangeText={setNewCenterCode}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateCostCenter}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Creando...' : 'Crear Centro'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'categories' && (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de la Categoría"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateCategory}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Creando...' : 'Crear Categoría'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#4F46E5',
  },
  content: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
  },
  exportButtonText: {
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
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#4F46E5',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleOptionTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
