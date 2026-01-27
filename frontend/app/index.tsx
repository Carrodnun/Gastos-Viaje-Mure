import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, usePathname, useNavigationContainerRef } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import LoadingScreen from '../src/components/LoadingScreen';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const router = useRouter();
  const pathname = usePathname();
  const navigationRef = useNavigationContainerRef();
  const { user, isLoading, isAuthenticated, checkAuth, login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    // Wait for navigation to be ready
    const checkNavReady = setInterval(() => {
      if (navigationRef?.isReady()) {
        setNavReady(true);
        clearInterval(checkNavReady);
      }
    }, 100);

    return () => clearInterval(checkNavReady);
  }, [navigationRef]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Only navigate when both authenticated AND navigation is ready
    if (isAuthenticated && user && navReady && pathname === '/') {
      // Small delay to ensure navigation is fully mounted
      setTimeout(() => {
        try {
          router.replace('/(tabs)/home');
        } catch (error) {
          console.log('Navigation not ready yet');
        }
      }, 100);
    }
  }, [isAuthenticated, user, navReady, pathname]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    try {
      setLoggingIn(true);
      await login(email, password);
      // Navigation will happen automatically via useEffect
    } catch (error: any) {
      Alert.alert('Error de Inicio de Sesión', error.message || 'Credenciales inválidas');
    } finally {
      setLoggingIn(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && !navReady) {
    return <LoadingScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="airplane" size={80} color="#4F46E5" />
        </View>
        
        <Text style={styles.title}>Control de Gastos de Viaje</Text>
        <Text style={styles.subtitle}>
          Gestiona los gastos de viaje de tu empresa
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loggingIn && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loggingIn}
          >
            {loggingIn ? (
              <Text style={styles.loginButtonText}>Iniciando...</Text>
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Captura de tickets</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Aprobación de viajes</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Exportación a Excel</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Si no tienes cuenta, contacta con tu administrador
        </Text>

        <Text style={styles.demoText}>
          Demo: admin@empresa.com / Admin123!
        </Text>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 24,
    backgroundColor: '#EEF2FF',
    padding: 24,
    borderRadius: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    width: '100%',
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  footer: {
    marginTop: 16,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  demoText: {
    marginTop: 8,
    fontSize: 12,
    color: '#4F46E5',
    textAlign: 'center',
    fontWeight: '600',
  },
});
