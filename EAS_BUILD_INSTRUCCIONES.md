# 📱 Guía de EAS Build - Control de Gastos de Viaje

Esta guía te permitirá crear builds de la app para instalar en dispositivos iOS y Android **sin publicar en las tiendas de aplicaciones**.

## 📋 Requisitos Previos

1. **Node.js** instalado (versión 18 o superior)
2. **Cuenta de Expo** creada (carrodnun@gmail.com ✅)
3. **EAS CLI** instalado globalmente

## 🚀 Pasos para Crear el Build

### Paso 1: Instalar EAS CLI

Abre una terminal en tu computadora y ejecuta:

```bash
npm install -g eas-cli
```

### Paso 2: Iniciar Sesión en Expo

```bash
eas login
```

Ingresa tu email: `carrodnun@gmail.com` y tu contraseña de Expo.

### Paso 3: Descargar el Código del Proyecto

Descarga el código de tu proyecto desde Emergent (botón de descarga) y descomprímelo.

### Paso 4: Navegar al Directorio Frontend

```bash
cd ruta/donde/descomprimiste/el-proyecto/frontend
```

### Paso 5: Instalar Dependencias

```bash
yarn install
```

### Paso 6: Configurar el Proyecto en Expo

La primera vez que ejecutes un build, EAS te preguntará si quieres crear un nuevo proyecto. Responde **Sí**.

```bash
eas build:configure
```

Esto generará automáticamente un `projectId` único para tu proyecto.

---

## 📱 Crear Build para Android (APK)

### Opción A: Build de Preview (Recomendado para pruebas)

```bash
eas build --platform android --profile preview
```

Este comando:
- Genera un archivo `.apk` que puedes instalar directamente
- No requiere firma de Google Play
- Ideal para distribuir a testers internos

### Opción B: Build de Development (Para desarrollo con hot reload)

```bash
eas build --platform android --profile development
```

Este build incluye herramientas de desarrollo y permite conectar con tu servidor de desarrollo local.

### Instalar el APK en Android

1. Una vez completado el build, EAS te dará un enlace para descargar el `.apk`
2. Transfiere el archivo a tu dispositivo Android
3. Habilita "Instalar desde fuentes desconocidas" en Configuración > Seguridad
4. Abre el archivo `.apk` para instalarlo

---

## 🍎 Crear Build para iOS

### Requisitos Adicionales para iOS

⚠️ **Para iOS necesitas:**
- Una cuenta de **Apple Developer** ($99/año) para distribución Ad Hoc
- O usar un **dispositivo registrado** en tu cuenta

### Opción A: Build de Preview (Ad Hoc Distribution)

```bash
eas build --platform ios --profile preview
```

Durante el proceso:
1. EAS te pedirá acceso a tu cuenta de Apple Developer
2. Registrará automáticamente los dispositivos de prueba
3. Generará los certificados necesarios

### Opción B: Simulador iOS (Sin Apple Developer Account)

Si no tienes cuenta de Apple Developer, puedes crear un build para el **Simulador de iOS**:

```bash
eas build --platform ios --profile development --local
```

Nota: Esto requiere una Mac con Xcode instalado.

### Registrar Dispositivos iOS para Testing

Antes de poder instalar en un iPhone real:

```bash
eas device:create
```

Esto genera un enlace que debes abrir en el iPhone que quieres registrar.

### Instalar en iPhone

1. Una vez completado el build, EAS te proporcionará un código QR
2. Escanea el código con la cámara de tu iPhone
3. Sigue las instrucciones para instalar el perfil de provisioning
4. La app aparecerá en tu pantalla de inicio

---

## ⚙️ Configuración de la URL del Backend

**IMPORTANTE:** Antes de crear un build de producción, debes configurar la URL de tu backend.

### Para pruebas locales:
El build usará la URL configurada en el archivo `.env`. Si tu backend está desplegado, actualiza:

```env
EXPO_PUBLIC_BACKEND_URL=https://tu-servidor-real.com
```

### Para la versión actual (desarrollo):
La app está configurada para conectarse a:
```
https://traveltrack-6.preview.emergentagent.com
```

---

## 🔧 Perfiles de Build Disponibles

| Perfil | Uso | Plataforma |
|--------|-----|------------|
| `development` | Desarrollo con hot reload | Android/iOS |
| `preview` | Testing interno (APK/Ad Hoc) | Android/iOS |
| `production` | Publicación en stores | Android/iOS |

---

## 📊 Estado del Build

Puedes ver el estado de tus builds en:
- Terminal: El progreso se muestra en tiempo real
- Web: https://expo.dev/accounts/carrodnun/projects

---

## 🆘 Solución de Problemas

### Error: "Owner field not set"
```bash
# Verifica que app.json tenga el campo owner
# Ya está configurado como "carrodnun"
```

### Error: "Project not found"
```bash
# Ejecuta de nuevo:
eas build:configure
```

### Error de certificados iOS
```bash
# Limpia y regenera los certificados:
eas credentials
```

### El APK no se instala
- Verifica que "Fuentes desconocidas" esté habilitado
- El archivo debe tener extensión `.apk`, no `.aab`

---

## 📞 Credenciales de Prueba

Para probar la app una vez instalada:

- **Email:** admin@empresa.com
- **Contraseña:** Admin123!

---

## 🎯 Resumen de Comandos Rápidos

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar proyecto
eas build:configure

# Build Android (APK para testing)
eas build --platform android --profile preview

# Build iOS (requiere Apple Developer Account)
eas build --platform ios --profile preview

# Ver estado de builds
eas build:list

# Registrar dispositivo iOS
eas device:create
```

---

## ✅ Próximos Pasos

1. Ejecuta el build de Android primero (es más sencillo)
2. Instala el APK en tu dispositivo
3. Prueba el login con las credenciales proporcionadas
4. Si necesitas iOS, configura tu cuenta de Apple Developer

¡La configuración está lista! Solo necesitas ejecutar los comandos en tu máquina local.
