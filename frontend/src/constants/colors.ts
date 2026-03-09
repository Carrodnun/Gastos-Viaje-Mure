// Paleta de colores moderna - App de Gastos de Viaje
// Estética iOS / Apple Design System
// Basada en RAL 6029 con degradados y glassmorphism

export const COLORS = {
  // === PRIMARIOS (con variantes para degradados) ===
  primary: '#1B7A3E',           // Verde Marca principal
  primaryMedium: '#22A050',     // Verde Medio
  primaryLight: '#2CC765',      // Verde Claro
  primaryDark: '#114D27',       // Verde Oscuro
  primaryUltraDark: '#0A3318',  // Verde muy oscuro para degradados

  // === SUPERFICIES iOS Style ===
  background: '#F2F2F7',        // Fondo sistema iOS
  backgroundGradientStart: '#E8F5EC',  // Verde muy claro
  backgroundGradientMid: '#E8F0F8',    // Azul pálido
  backgroundGradientEnd: '#F0EBF5',    // Lavanda tenue
  
  // Glassmorphism
  glassWhite: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.9)',
  glassBackground: 'rgba(255, 255, 255, 0.85)',
  
  cardBackground: '#EEF7F2',    // Fondo de tarjetas
  card: '#FFFFFF',              // Tarjetas
  cardElevated: '#FFFFFF',      // Tarjeta elevada
  
  headerDark: '#114D27',        // Header principal
  headerGradientStart: '#114D27',
  headerGradientEnd: '#0D3D1F',

  // === ACENTOS ===
  info: '#1B527A',              // Azul para info y enlaces
  infoLight: '#E8F4FC',         // Fondo info
  warning: '#E8A020',           // Ámbar para pendientes
  warningLight: '#FEF3C7',      // Fondo warning
  pending: '#E8A020',           // Pendientes
  error: '#D94F3D',             // Coral para errores
  errorLight: '#FEE2E2',        // Fondo error
  rejected: '#D94F3D',          // Rechazados

  // === ESTADOS POSITIVOS ===
  success: '#2CC765',           // Verde claro para éxito
  successLight: '#D1FAE5',      // Fondo success
  approved: '#2CC765',          // Aprobados

  // === NEUTROS iOS ===
  text: '#1C1C1E',              // Texto principal (iOS label)
  textSecondary: '#3C3C43',     // Texto secundario
  textTertiary: '#636366',      // Texto terciario
  textMuted: '#8E8E93',         // Texto atenuado (iOS secondary label)
  textOnDark: '#FFFFFF',        // Texto sobre fondo oscuro
  textOnDarkMuted: '#B8D4C2',   // Texto atenuado sobre oscuro
  
  // === BORDES iOS ===
  separator: 'rgba(60, 60, 67, 0.12)',  // Separador iOS
  border: '#C8D8CE',            // Borde principal
  borderLight: 'rgba(60, 60, 67, 0.08)', // Borde suave
  borderDark: '#A3B8AB',        // Borde oscuro

  // === AVATAR/ICONOS ===
  avatarBg: '#1B7A3E',          // Fondo de avatar
  avatarBgAlt: '#22A050',       // Fondo avatar alternativo
  iconActive: '#1B7A3E',        // Iconos activos
  iconInactive: '#8E8E93',      // Iconos inactivos

  // === SOMBRAS iOS ===
  shadowColor: 'rgba(0, 0, 0, 0.07)',
  shadowColorMedium: 'rgba(0, 0, 0, 0.12)',
  shadowColorDark: 'rgba(17, 77, 39, 0.3)',

  // === OVERLAYS ===
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(27, 122, 62, 0.08)',

  // === COMPATIBILIDAD ===
  primaryBackground: '#EEF7F2',
};

// Degradados para uso con LinearGradient
export const GRADIENTS = {
  // Fondo mesh iOS style
  backgroundMesh: ['#E8F5EC', '#E8F0F8', '#F0EBF5'],
  
  // Header gradients
  header: ['#114D27', '#0D3D1F'],
  headerLight: ['#1B7A3E', '#22A050'],
  
  // Buttons
  primaryButton: ['#1B7A3E', '#22A050'],
  success: ['#22A050', '#2CC765'],
  
  // Cards
  card: ['#FFFFFF', '#FAFCFB'],
  
  // Guide block
  guideBlock: ['#114D27', '#0D3D1F'],
};

// Estilos de sombra iOS
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 8,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  }),
};

// Constantes de diseño iOS
export const DESIGN = {
  borderRadius: {
    small: 12,
    medium: 16,
    large: 20,
    xl: 24,
    pill: 100,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};
