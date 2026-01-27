# PRD: App de Control de Gastos de Viaje

## Visión General
Aplicación móvil para gestionar y controlar los gastos de viaje de los trabajadores de una empresa, con sistema de aprobación multinivel y exportación a Excel.

## Roles de Usuario
1. **Usuario (Trabajador)**: Crea viajes, añade gastos, captura tickets
2. **Autorizador**: Aprueba o rechaza viajes creados por usuarios
3. **Administrador**: Gestiona usuarios, centros de coste, categorías, exporta datos

## Funcionalidades Principales

### 1. Autenticación
- Sistema de autenticación Microsoft Outlook OAuth
- Solo el administrador puede crear cuentas de usuario
- El administrador asigna roles a los usuarios

### 2. Gestión de Viajes
- Usuario crea proyecto/viaje con:
  - Nombre del viaje
  - Centro de coste (selección de 15 predefinidos)
  - Participantes (solo el creador o con compañeros)
- Estados del viaje:
  - **Pendiente**: Esperando aprobación
  - **Aprobado**: Puede recibir gastos
  - **Rechazado**: No puede recibir gastos
- Los participantes añadidos tienen acceso al viaje
- Los gastos solo se pueden asignar a viajes aprobados

### 3. Gestión de Gastos
- Campos requeridos:
  - Importe
  - Fecha
  - Establecimiento
  - Motivo (dropdown con opciones predefinidas editables)
  - Foto del ticket (captura con cámara del dispositivo)
- Permisos de edición:
  - Usuario: solo sus propios gastos
  - Administrador: todos los gastos

### 4. Sistema de Aprobación
- Autorizadores reciben notificaciones de nuevos viajes
- Pueden aprobar o rechazar viajes
- Notificaciones de cambio de estado a los participantes

### 5. Exportación a Excel (Solo Admin)
- Columnas: usuario, centro de coste, fecha, gasto, motivo del gasto
- Formato compatible con sistemas de contabilidad

### 6. Auditoría
- Historial de cambios en viajes y gastos
- Registro de quién modificó qué y cuándo

## Modelos de Datos

### Users
```
{
  user_id: string,
  email: string,
  name: string,
  picture: string,
  role: "user" | "approver" | "admin",
  created_at: datetime
}
```

### Cost Centers
```
{
  center_id: string,
  name: string,
  code: string,
  active: boolean,
  created_at: datetime
}
```

### Expense Categories
```
{
  category_id: string,
  name: string,
  active: boolean,
  order: number,
  created_at: datetime
}
```

### Trips
```
{
  trip_id: string,
  name: string,
  creator_id: string,
  cost_center_id: string,
  status: "pending" | "approved" | "rejected",
  participants: [user_id],
  created_at: datetime,
  approved_by: string | null,
  approved_at: datetime | null,
  rejection_reason: string | null
}
```

### Expenses
```
{
  expense_id: string,
  trip_id: string,
  user_id: string,
  amount: float,
  date: datetime,
  establishment: string,
  category_id: string,
  receipt_image: string (base64),
  notes: string,
  created_at: datetime,
  modified_at: datetime,
  modified_by: string
}
```

### Audit Logs
```
{
  log_id: string,
  entity_type: "trip" | "expense",
  entity_id: string,
  action: "created" | "updated" | "deleted" | "approved" | "rejected",
  user_id: string,
  changes: object,
  timestamp: datetime
}
```

## API Endpoints

### Auth
- `POST /api/auth/session` - Exchange session_id for session_token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Admin
- `POST /api/admin/users` - Create user
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/{user_id}` - Update user role
- `POST /api/admin/cost-centers` - Create cost center
- `GET /api/admin/cost-centers` - List cost centers
- `PUT /api/admin/cost-centers/{center_id}` - Update cost center
- `POST /api/admin/expense-categories` - Create category
- `GET /api/admin/expense-categories` - List categories
- `PUT /api/admin/expense-categories/{category_id}` - Update category
- `GET /api/admin/export/excel` - Export to Excel

### Trips
- `POST /api/trips` - Create trip
- `GET /api/trips` - List my trips
- `GET /api/trips/{trip_id}` - Get trip details
- `PUT /api/trips/{trip_id}` - Update trip (only if pending)
- `POST /api/trips/{trip_id}/approve` - Approve trip (approver)
- `POST /api/trips/{trip_id}/reject` - Reject trip (approver)
- `GET /api/trips/pending` - List pending trips (approver)

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/trip/{trip_id}` - List trip expenses
- `GET /api/expenses/{expense_id}` - Get expense details
- `PUT /api/expenses/{expense_id}` - Update expense
- `DELETE /api/expenses/{expense_id}` - Delete expense

### Audit
- `GET /api/audit/{entity_type}/{entity_id}` - Get audit logs

## Navegación Mobile

### Tab Navigation (Bottom Tabs)
1. **Inicio** - Dashboard con resumen
2. **Viajes** - Lista de mis viajes
3. **Nuevo** - Crear viaje
4. **Perfil** - Configuración y logout

### Stack Navigation
- Detalle de Viaje → Lista de Gastos → Crear/Editar Gasto
- Panel Admin (solo admin)
- Aprobaciones (solo autorizadores)

## Categorías de Gastos Predefinidas
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

## Fases de Implementación

### Fase 1: Setup y Autenticación ✓
- Configurar proyecto base
- Implementar autenticación Microsoft OAuth
- Sistema de roles y permisos

### Fase 2: Panel Admin
- Crear usuarios
- Gestionar centros de coste
- Gestionar categorías de gastos

### Fase 3: Gestión de Viajes
- CRUD de viajes
- Asignación de participantes
- Sistema de aprobación

### Fase 4: Gestión de Gastos
- CRUD de gastos
- Captura de tickets con cámara
- Almacenamiento en base64

### Fase 5: Exportación y Auditoría
- Exportación a Excel
- Historial de cambios
- Notificaciones

### Fase 6: Testing y Optimización
- Testing backend completo
- Testing frontend mobile
- Optimización de UX
