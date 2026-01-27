import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import LoadingScreen from '../src/components/LoadingScreen';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, checkAuth, login } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="airplane" size={80} color="#4F46E5" />
        </View>
        
        <Text style={styles.title}>Control de Gastos de Viaje</Text>
        <Text style={styles.subtitle}>
          Gestiona los gastos de viaje de tu empresa de forma simple y eficiente
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Captura de tickets</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Aprobación de viajes</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Exportación a Excel</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={login}>
          <Ionicons name="logo-microsoft" size={24} color="#FFFFFF" />
          <Text style={styles.loginButtonText}>Iniciar Sesión con Microsoft</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Si no tienes cuenta, contacta con tu administrador
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
    backgroundColor: '#EEF2FF',
    padding: 24,
    borderRadius: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  features: {
    width: '100%',
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  footer: {
    marginTop: 24,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
