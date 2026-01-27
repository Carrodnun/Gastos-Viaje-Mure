# App de Control de Gastos de Viaje 🛫💰

Aplicación móvil completa para gestionar y controlar los gastos de viaje de los trabajadores de tu empresa.

## ✨ Características Principales

### Para Todos los Usuarios
- 🔐 **Autenticación segura** con Google OAuth
- ✈️ **Gestión de viajes** con múltiples participantes
- 💳 **Registro de gastos** con captura de tickets vía cámara
- 📊 **Dashboard** con estadísticas de viajes
- 🔍 **Búsqueda y filtros** para encontrar viajes fácilmente

### Para Autorizadores
- ✅ **Aprobación de viajes** en tiempo real
- ❌ **Rechazo con motivo** para proporcionar feedback
- 📋 **Vista de viajes pendientes** para gestión eficiente

### Para Administradores
- 👥 **Gestión de usuarios** con roles personalizados
- 🏢 **Centros de coste** configurables
- 🏷️ **Categorías de gastos** editables
- 📥 **Exportación a Excel** para contabilidad
- 📜 **Auditoría completa** de todas las acciones

## 🚀 Estado Actual

### Backend ✅
- **Framework**: FastAPI con Python
- **Base de datos**: MongoDB
- **Autenticación**: Google OAuth via Emergent Auth
- **API REST completa** con endpoints para:
  - Gestión de usuarios
  - Viajes y aprobaciones
  - Gastos con imágenes base64
  - Exportación a Excel
  - Auditoría

### Frontend ✅
- **Framework**: Expo React Native
- **Navegación**: Tab navigation con visibilidad basada en roles
- **Gestión de estado**: Zustand
- **Captura de imágenes**: Expo Camera & Image Picker
- **Compatibilidad**: iOS, Android y Web

## 📱 Pantallas Implementadas

1. **Login**: Pantalla de inicio con autenticación Microsoft
2. **Home/Dashboard**: Resumen de viajes y estadísticas
3. **Viajes**: Lista con búsqueda y filtros
4. **Crear Viaje**: Formulario con selección de centro de coste y participantes
5. **Detalle de Viaje**: Información completa y lista de gastos
6. **Crear Gasto**: Formulario con captura de foto del ticket
7. **Detalle de Gasto**: Vista completa del gasto con imagen
8. **Aprobaciones**: Lista de viajes pendientes para autorizar
9. **Admin**: Panel con 3 tabs (Usuarios, Centros, Categorías)
10. **Perfil**: Información del usuario y logout

## 👤 Usuarios de Prueba

Ya se han creado 3 usuarios de prueba. Para iniciar sesión usa Google OAuth con estos emails:

| Email | Rol | Permisos |
|-------|-----|----------|
| `admin@empresa.com` | Administrador | Todos los permisos |
| `autorizador@empresa.com` | Autorizador | Aprobar/Rechazar viajes |
| `trabajador@empresa.com` | Usuario | Crear viajes y gastos |

## 🏢 Datos de Prueba

### Centros de Coste (5)
- Ventas (CC-001)
- Marketing (CC-002)
- IT (CC-003)
- Administración (CC-004)
- Operaciones (CC-005)

### Categorías de Gastos (10)
1. Transporte
2. Alojamiento
3. Comidas
4. Combustible
5. Parking
6. Peajes
7. Taxi/Uber
8. Material de oficina
9. Teléfono/Comunicaciones
10. Otros gastos

## 🔄 Flujo de Trabajo

### Flujo Típico de Usuario
1. **Login** con cuenta de Microsoft
2. **Crear viaje** asignando centro de coste y participantes
3. Esperar **aprobación** del autorizador
4. Una vez aprobado, **añadir gastos** con fotos de tickets
5. Ver resumen en el dashboard

### Flujo de Autorizador
1. Ver **viajes pendientes** en pestaña "Aprobar"
2. Revisar detalles del viaje
3. **Aprobar** o **Rechazar** (con motivo opcional)

### Flujo de Administrador
1. **Crear usuarios** con roles específicos
2. **Gestionar centros de coste** activos
3. **Editar categorías** de gastos
4. **Exportar datos** a Excel para contabilidad
5. Ver **auditoría completa** de cambios

## 📸 Captura de Tickets

La app solicita permisos de cámara en el primer uso. Dos opciones disponibles:
- 📷 **Tomar foto**: Captura directa con la cámara
- 🖼️ **Seleccionar de galería**: Elegir foto existente

Las imágenes se guardan en formato **base64** para compatibilidad total.

## 📊 Exportación a Excel

El administrador puede exportar todos los gastos a Excel con las siguientes columnas:
- Usuario
- Centro de Coste
- Fecha
- Gasto (€)
- Motivo
- Establecimiento
- Viaje

## 🔒 Seguridad y Permisos

### Roles y Permisos
- **Usuario**: Solo edita sus propios gastos
- **Autorizador**: Aprueba/rechaza viajes + permisos de usuario
- **Administrador**: Control total del sistema

### Sistema de Aprobación
- Viajes deben estar **aprobados** antes de añadir gastos
- Solo autorizadores y administradores pueden aprobar
- Historial completo de aprobaciones/rechazos

## 📝 Auditoría

Todas las acciones importantes quedan registradas:
- Creación/edición/eliminación de viajes
- Creación/edición/eliminación de gastos
- Aprobaciones y rechazos
- Usuario que realizó la acción
- Timestamp preciso

## 🛠️ Tecnologías Utilizadas

### Backend
- FastAPI (Python)
- MongoDB (motor async)
- httpx (llamadas HTTP)
- openpyxl (exportación Excel)
- python-multipart (archivos)

### Frontend
- Expo SDK
- React Native
- Expo Router (navegación)
- Zustand (estado global)
- Expo Camera & Image Picker
- Axios (API calls)
- date-fns (formateo de fechas)

## 📦 Estructura del Proyecto

```
/app
├── backend/
│   ├── server.py          # API FastAPI completa
│   ├── requirements.txt   # Dependencias Python
│   └── .env              # Variables de entorno
├── frontend/
│   ├── app/              # Pantallas (expo-router)
│   │   ├── index.tsx     # Login
│   │   ├── (tabs)/       # Navegación principal
│   │   ├── trip/         # Detalle de viaje
│   │   └── expense/      # Crear/ver gastos
│   ├── src/
│   │   ├── store/        # Zustand stores
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utilidades (API)
│   │   └── components/   # Componentes compartidos
│   └── package.json
├── test_result.md        # Estado de testing
└── init_test_data.sh    # Script de datos de prueba
```

## 🎯 Próximos Pasos Recomendados

### Mejoras Sugeridas
1. **Notificaciones Push** cuando cambia estado de viaje
2. **Modo Offline** con sincronización posterior
3. **Filtros avanzados** en lista de gastos
4. **Gráficos** de gastos por categoría
5. **Límites de gasto** por centro de coste
6. **OCR** para extraer datos automáticamente de tickets

### Testing
- Probar autenticación con cuentas Microsoft reales
- Verificar flujo completo usuario → autorizador → admin
- Testear captura de cámara en dispositivos físicos
- Validar exportación Excel con datos reales
- Probar permisos y restricciones por rol

## 📞 Soporte

Si encuentras algún problema o necesitas ayuda:
1. Revisa los logs del backend en `/var/log/supervisor/backend.err.log`
2. Revisa los logs del frontend en `/var/log/supervisor/expo.err.log`
3. Verifica que todos los servicios estén corriendo: `sudo supervisorctl status`

## 🎉 ¡Listo para Usar!

La aplicación está completamente funcional y lista para probar. Inicia sesión con cualquiera de los usuarios de prueba y explora todas las funcionalidades.

**¡Feliz gestión de gastos! 🚀**
