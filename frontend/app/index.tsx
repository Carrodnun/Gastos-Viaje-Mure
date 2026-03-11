import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname, useNavigationContainerRef } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import LoadingScreen from '../src/components/LoadingScreen';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, DESIGN } from '../src/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

// Logo URL
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_99826fab-0c79-47aa-8b4f-531fdc36c7f6/artifacts/6x1i2ave_logo%20v256.jpg';

const { width } = Dimensions.get('window');

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
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrada animada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      if (Platform.OS === 'web') {
        window.alert('Por favor ingresa email y contraseña');
      } else {
        Alert.alert('Error', 'Por favor ingresa email y contraseña');
      }
      return;
    }

    try {
      setLoggingIn(true);
      await login(email, password);
    } catch (error: any) {
      const errorMsg = error.message || 'Email o contraseña incorrectos';
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert('Error de Inicio de Sesión', errorMsg);
      }
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
    <LinearGradient
      colors={['#E8F5EC', '#E8F0F8', '#F0EBF5']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Header Pill iOS Style */}
          <View style={styles.headerPill}>
            <Image
              source={{ uri: LOGO_URL }}
              style={styles.pillLogo}
              resizeMode="cover"
            />
            <Text style={styles.pillText}>Control Gastos</Text>
          </View>

          {/* Logo Principal */}
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

          {/* Card Glassmorphism */}
          <View style={styles.glassCard}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              </View>
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
              <View style={styles.inputIconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
              </View>
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
                  color={COLORS.textMuted} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loggingIn && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loggingIn}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1B7A3E', '#22A050']}
                style={styles.loginButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loggingIn ? (
                  <Text style={styles.loginButtonText}>Iniciando...</Text>
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: COLORS.successLight }]}>
                <Ionicons name="camera" size={16} color={COLORS.success} />
              </View>
              <Text style={styles.featureText}>Captura de tickets</Text>
            </View>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: COLORS.infoLight }]}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.info} />
              </View>
              <Text style={styles.featureText}>Aprobación de viajes</Text>
            </View>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: COLORS.warningLight }]}>
                <Ionicons name="document-text" size={16} color={COLORS.warning} />
              </View>
              <Text style={styles.featureText}>Exportación a Excel</Text>
            </View>
          </View>

          <Text style={styles.footer}>
            Si no tienes cuenta, contacta con tu administrador
          </Text>

          <View style={styles.demoContainer}>
            <Text style={styles.demoLabel}>Demo</Text>
            <Text style={styles.demoText}>admin@empresa.com / Admin123!</Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassWhite,
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingRight: 20,
    borderRadius: DESIGN.borderRadius.pill,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.small,
  },
  pillLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 10,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.01 * 14,
  },
  logoContainer: {
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: DESIGN.borderRadius.large,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.03 * 26,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.glassBackground,
    borderRadius: DESIGN.borderRadius.xl,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: DESIGN.borderRadius.medium,
    marginBottom: 16,
  },
  inputIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: 14,
  },
  loginButton: {
    borderRadius: DESIGN.borderRadius.medium,
    overflow: 'hidden',
    marginTop: 8,
    ...SHADOWS.colored('#1B7A3E'),
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.01 * 17,
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
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footer: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  demoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: DESIGN.borderRadius.medium,
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.glassWhite,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
    overflow: 'hidden',
    letterSpacing: 0.05 * 12,
    textTransform: 'uppercase',
  },
  demoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'SF Mono' : 'monospace',
  },
});
