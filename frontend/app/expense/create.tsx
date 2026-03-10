import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../src/utils/api';
import { ExpenseCategory } from '../../src/types';
import { COLORS } from '../../src/constants/colors';

export default function CreateExpenseScreen() {
  const { tripId } = useLocalSearchParams();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [establishment, setEstablishment] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState('');
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Se necesitan permisos de cámara y galería para capturar tickets'
      );
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/admin/expense-categories');
      setCategories(response.data.categories.filter((c: ExpenseCategory) => c.active));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setReceiptImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo capturar la foto');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setReceiptImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Añadir Ticket',
      'Selecciona cómo quieres agregar el ticket',
      [
        { text: 'Tomar Foto', onPress: takePhoto },
        { text: 'Seleccionar de Galería', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (!date) {
      Alert.alert('Error', 'Por favor selecciona una fecha');
      return;
    }

    if (!establishment.trim()) {
      Alert.alert('Error', 'Por favor ingresa el establecimiento');
      return;
    }

    if (!categoryId) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return;
    }

    if (!receiptImage) {
      Alert.alert('Error', 'Por favor captura o selecciona una foto del ticket');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/expenses', {
        trip_id: tripId,
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        establishment: establishment.trim(),
        category_id: categoryId,
        receipt_image: receiptImage,
        notes: notes.trim() || null,
      });

      // Navigate back to trip detail immediately
      router.back();

      // Show success message after navigation
      setTimeout(() => {
        if (Platform.OS === 'web') {
          window.alert('Gasto creado correctamente');
        } else {
          Alert.alert('Éxito', 'Gasto creado correctamente');
        }
      }, 300);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Error al crear el gasto'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.category_id === categoryId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Gasto</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Monto *</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currencySymbol}>€</Text>
            <TextInput
              style={styles.amountTextInput}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Fecha *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Establecimiento *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Restaurante Los Pinos"
            value={establishment}
            onChangeText={setEstablishment}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Categoría *</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text
              style={selectedCategory ? styles.pickerText : styles.pickerPlaceholder}
            >
              {selectedCategory ? selectedCategory.name : 'Seleccionar categoría'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notas (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Agregar detalles adicionales..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Foto del Ticket *</Text>
          {receiptImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: receiptImage }} style={styles.receiptImage} />
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.imageActionButton}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera" size={20} color={COLORS.primary} />
                  <Text style={styles.imageActionText}>Cámara</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageActionButton}
                  onPress={pickImage}
                >
                  <Ionicons name="images" size={20} color={COLORS.primary} />
                  <Text style={styles.imageActionText}>Galería</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.captureOptions}>
              <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                <Ionicons name="camera" size={32} color={COLORS.primary} />
                <Text style={styles.captureButtonText}>Tomar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureButton} onPress={pickImage}>
                <Ionicons name="images" size={32} color={COLORS.primary} />
                <Text style={styles.captureButtonText}>Desde Galería</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Crear Gasto</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para seleccionar categoría */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.category_id}
                  style={[
                    styles.modalOption,
                    categoryId === category.category_id && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setCategoryId(category.category_id);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    categoryId === category.category_id && styles.modalOptionTextSelected,
                  ]}>
                    {category.name}
                  </Text>
                  {categoryId === category.category_id && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.headerDark,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.text,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  captureOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  captureButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  captureButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  imageContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 8,
  },
  receiptImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primaryBackground,
    borderRadius: 8,
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalScroll: {
    padding: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  modalOptionSelected: {
    backgroundColor: COLORS.primaryBackground,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  modalOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
