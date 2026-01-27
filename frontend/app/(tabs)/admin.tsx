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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { User, CostCenter, ExpenseCategory } from '../../src/types';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';

export default function AdminScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'centers' | 'categories'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<{id: string; name: string; type: string} | null>(null);

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

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const resetForm = () => {
    setNewUserEmail('');
    setNewUserName('');
    setNewUserRole('user');
    setNewCenterName('');
    setNewCenterCode('');
    setNewCategoryName('');
    setEditMode(false);
    setEditId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditMode(true);
    if (activeTab === 'users') {
      setEditId(item.user_id);
      setNewUserName(item.name);
      setNewUserEmail(item.email);
      setNewUserRole(item.role);
    } else if (activeTab === 'centers') {
      setEditId(item.center_id);
      setNewCenterName(item.name);
      setNewCenterCode(item.code);
    } else if (activeTab === 'categories') {
      setEditId(item.category_id);
      setNewCategoryName(item.name);
    }
    setShowModal(true);
  };

  const openDeleteModal = (id: string, name: string, type: string) => {
    setDeleteItem({ id, name, type });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      setLoading(true);
      let endpoint = '';
      if (deleteItem.type === 'user') {
        endpoint = `/api/admin/users/${deleteItem.id}`;
      } else if (deleteItem.type === 'center') {
        endpoint = `/api/admin/cost-centers/${deleteItem.id}`;
      } else if (deleteItem.type === 'category') {
        endpoint = `/api/admin/expense-categories/${deleteItem.id}`;
      }

      await api.delete(endpoint);
      showAlert('Éxito', 'Elemento eliminado correctamente');
      setShowDeleteModal(false);
      setDeleteItem(null);
      loadData();
    } catch (error: any) {
      console.error('Error deleting:', error);
      showAlert('Error', error.response?.data?.detail || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserName) {
      showAlert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      if (editMode && editId) {
        await api.put(`/api/admin/users/${editId}`, {
          email: newUserEmail,
          name: newUserName,
          role: newUserRole,
        });
        showAlert('Éxito', 'Usuario actualizado');
      } else {
        const response = await api.post('/api/admin/users', {
          email: newUserEmail,
          name: newUserName,
          role: newUserRole,
        });
        showAlert('Éxito', `Usuario creado. Contraseña temporal: ${response.data.temporary_password}`);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      showAlert('Error', error.response?.data?.detail || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCostCenter = async () => {
    if (!newCenterName || !newCenterCode) {
      showAlert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      if (editMode && editId) {
        await api.put(`/api/admin/cost-centers/${editId}`, {
          name: newCenterName,
          code: newCenterCode,
        });
        showAlert('Éxito', 'Centro de coste actualizado');
      } else {
        await api.post('/api/admin/cost-centers', {
          name: newCenterName,
          code: newCenterCode,
        });
        showAlert('Éxito', 'Centro de coste creado');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      showAlert('Error', error.response?.data?.detail || 'Error al guardar centro');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) {
      showAlert('Error', 'Por favor ingresa un nombre');
      return;
    }

    try {
      setLoading(true);
      if (editMode && editId) {
        await api.put(`/api/admin/expense-categories/${editId}`, {
          name: newCategoryName,
        });
        showAlert('Éxito', 'Categoría actualizada');
      } else {
        await api.post('/api/admin/expense-categories', {
          name: newCategoryName,
        });
        showAlert('Éxito', 'Categoría creada');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      showAlert('Error', error.response?.data?.detail || 'Error al guardar categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      showAlert('Exportar', 'La exportación a Excel se descargará automáticamente');
      const response = await api.get('/api/admin/export/excel', {
        responseType: 'blob',
      });
      showAlert('Éxito', 'Archivo descargado');
    } catch (error: any) {
      showAlert('Error', 'Error al exportar');
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
                <TouchableOpacity style={styles.listItemLeft} onPress={() => openEditModal(user)}>
                  <Ionicons name="person-circle" size={40} color={COLORS.primary} />
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{user.name}</Text>
                    <Text style={styles.listItemSubtitle}>{user.email}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.listItemRight}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{getRoleText(user.role)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => openDeleteModal(user.user_id, user.name, 'user')}
                  >
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'centers' && (
          <View>
            {costCenters.map((center) => (
              <View key={center.center_id} style={styles.listItem}>
                <TouchableOpacity style={styles.listItemLeft} onPress={() => openEditModal(center)}>
                  <Ionicons name="business" size={40} color={COLORS.primary} />
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{center.name}</Text>
                    <Text style={styles.listItemSubtitle}>{center.code}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.listItemRight}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: center.active ? COLORS.success : COLORS.error },
                    ]}
                  />
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => openDeleteModal(center.center_id, center.name, 'center')}
                  >
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'categories' && (
          <View>
            {categories.map((category) => (
              <View key={category.category_id} style={styles.listItem}>
                <TouchableOpacity style={styles.listItemLeft} onPress={() => openEditModal(category)}>
                  <Ionicons name="pricetag" size={40} color={COLORS.primary} />
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{category.name}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.listItemRight}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: category.active ? COLORS.success : COLORS.error },
                    ]}
                  />
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => openDeleteModal(category.category_id, category.name, 'category')}
                  >
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Ionicons name="download" size={20} color="#FFFFFF" />
          <Text style={styles.exportButtonText}>Exportar a Excel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Modal para Crear/Editar */}
      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Editar' : 'Nuevo'}{' '}
                {activeTab === 'users' && 'Usuario'}
                {activeTab === 'centers' && 'Centro de Coste'}
                {activeTab === 'categories' && 'Categoría'}
              </Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {activeTab === 'users' && (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  value={newUserName}
                  onChangeText={setNewUserName}
                  placeholderTextColor={COLORS.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={newUserEmail}
                  onChangeText={setNewUserEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.textMuted}
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
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {editMode ? 'Actualizar' : 'Crear Usuario'}
                    </Text>
                  )}
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
                  placeholderTextColor={COLORS.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Código"
                  value={newCenterCode}
                  onChangeText={setNewCenterCode}
                  placeholderTextColor={COLORS.textMuted}
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateCostCenter}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {editMode ? 'Actualizar' : 'Crear Centro'}
                    </Text>
                  )}
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
                  placeholderTextColor={COLORS.textMuted}
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateCategory}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {editMode ? 'Actualizar' : 'Crear Categoría'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para Confirmar Eliminación */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalIcon}>
              <Ionicons name="warning" size={48} color={COLORS.error} />
            </View>
            <Text style={styles.deleteModalTitle}>Confirmar Eliminación</Text>
            <Text style={styles.deleteModalText}>
              ¿Estás seguro que deseas eliminar "{deleteItem?.name}"?
            </Text>
            <Text style={styles.deleteModalWarning}>
              Esta acción no se puede deshacer.
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalCancelButton]}
                onPress={() => { setShowDeleteModal(false); setDeleteItem(null); }}
                disabled={loading}
              >
                <Text style={styles.deleteModalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalConfirmButton]}
                onPress={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.deleteModalConfirmText}>Eliminar</Text>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
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
    color: COLORS.text,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleBadge: {
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deleteButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
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
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
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
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
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
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: COLORS.primary,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleOptionTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deleteModalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  deleteModalIcon: {
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteModalWarning: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalCancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deleteModalConfirmButton: {
    backgroundColor: COLORS.error,
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  deleteModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
