// Paleta de colores moderna - App de Gastos de Viaje
// Basada en RAL 6029 con degradados y efectos modernos

export const COLORS = {
  // === PRIMARIOS (con variantes para degradados) ===
  primary: '#1B7A3E',           // Verde Marca principal
  primaryMedium: '#22A050',     // Verde Medio
  primaryLight: '#2CC765',      // Verde Claro
  primaryDark: '#114D27',       // Verde Oscuro
  primaryUltraDark: '#0A3318',  // Verde muy oscuro para degradados

  // === SUPERFICIES ===
  background: '#FFFFFF',        // Fondo base
  backgroundAlt: '#F8FBF9',     // Fondo alternativo con tinte verde
  cardBackground: '#EEF7F2',    // Fondo de tarjetas
  card: '#FFFFFF',              // Tarjetas
  headerDark: '#114D27',        // Header principal
  headerGradientStart: '#114D27',
  headerGradientEnd: '#1B7A3E',

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

  // === NEUTROS ===
  text: '#1A1F1C',              // Texto principal
  textSecondary: '#4D5E54',     // Texto secundario
  textMuted: '#7A8A80',         // Texto atenuado
  textOnDark: '#FFFFFF',        // Texto sobre fondo oscuro
  textOnDarkMuted: '#B8D4C2',   // Texto atenuado sobre oscuro
  
  // === BORDES ===
  border: '#C8D8CE',            // Borde principal
  borderLight: '#E2EBE6',       // Borde suave
  borderDark: '#A3B8AB',        // Borde oscuro

  // === AVATAR/ICONOS ===
  avatarBg: '#1B7A3E',          // Fondo de avatar
  avatarBgAlt: '#22A050',       // Fondo avatar alternativo
  iconActive: '#1B7A3E',        // Iconos activos
  iconInactive: '#7A8A80',      // Iconos inactivos

  // === OVERLAYS ===
  overlay: 'rgba(17, 77, 39, 0.5)',     // Overlay oscuro con verde
  overlayLight: 'rgba(27, 122, 62, 0.1)', // Overlay claro

  // === COMPATIBILIDAD ===
  primaryBackground: '#EEF7F2',
};

// Degradados para uso con LinearGradient
export const GRADIENTS = {
  header: ['#0A3318', '#114D27', '#1B7A3E'],
  headerLight: ['#114D27', '#1B7A3E'],
  primaryButton: ['#1B7A3E', '#22A050'],
  success: ['#22A050', '#2CC765'],
  card: ['#FFFFFF', '#F8FBF9'],
};
