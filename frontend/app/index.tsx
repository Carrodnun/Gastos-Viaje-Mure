import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter, usePathname, useNavigationContainerRef } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import LoadingScreen from '../src/components/LoadingScreen';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/colors';

// Logo URL
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_99826fab-0c79-47aa-8b4f-531fdc36c7f6/artifacts/6x1i2ave_logo%20v256.jpg';

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
    if (isAuthenticated && user && navReady && pathname === '/') {
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: LOGO_URL }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>Control de Gastos de Viaje</Text>
        <Text style={styles.subtitle}>
          Gestiona los gastos de viaje de tu empresa
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={COLORS.textMuted}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={COLORS.textSecondary} 
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
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>Captura de tickets</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>Aprobación de viajes</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
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
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.text,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.textMuted,
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
    color: COLORS.text,
    marginLeft: 8,
  },
  footer: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  demoText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
