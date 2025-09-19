# 🚀 PROTALENT - Backend API

## 📋 Descripción
Backend API para la plataforma PROTALENT, que conecta estudiantes y egresados de TECSUP con empresas para oportunidades laborales y prácticas profesionales.

## 🏗️ Arquitectura del Sistema

### Tecnologías Principales
- **Node.js** + **Express.js** - Servidor web
- **Prisma ORM** - Gestión de base de datos
- **PostgreSQL** - Base de datos principal
- **JWT** - Autenticación y autorización
- **Google OAuth 2.0** - Autenticación con Google
- **Cloudinary** - Almacenamiento de archivos (CV, fotos, logos)
- **Socket.IO** - Chat en tiempo real
- **bcryptjs** - Encriptación de contraseñas

### Estructura del Proyecto
```
Backend_Protalent/
├── src/
│   ├── controllers/     # Lógica de negocio
│   ├── routes/         # Definición de rutas
│   ├── middlewares/    # Middlewares personalizados
│   ├── services/       # Servicios auxiliares
│   ├── config/         # Configuraciones
│   └── utils/          # Utilidades
├── prisma/
│   └── schema.prisma   # Esquema de base de datos
├── scripts/            # Scripts de utilidad
└── swagger/           # Documentación API
```

## 👥 Roles del Sistema

### 🎓 ESTUDIANTE
- Estudiantes actuales de TECSUP
- Pueden postular a ofertas laborales
- Subir CV y carta de presentación
- Participar en el blog

### 🎓 EGRESADO
- Graduados de TECSUP
- Mismas funcionalidades que estudiantes
- Campo adicional: año de egreso

### 🏢 EMPRESA
- Empresas que buscan talento
- Crear y gestionar ofertas laborales
- Ver postulaciones de estudiantes/egresados
- Gestionar perfil empresarial

### 👨‍💼 ADMIN
- Administradores del sistema
- Gestión completa de usuarios
- Moderación de contenido
- Acceso a estadísticas y reportes

## 🔐 Sistema de Autenticación

### Métodos de Registro/Login
1. **Registro Manual**: Email + contraseña + datos específicos por rol
2. **Google OAuth**: Para usuarios con cuentas @tecsup.edu.pe (estudiantes/egresados)

### Flujo de Autenticación con Google
1. Usuario selecciona rol (estudiante/egresado/empresa)
2. Popup de Google OAuth
3. Validación del token en backend
4. Si es nuevo usuario → redirección a completar perfil
5. Si perfil completo → redirección al dashboard

### Validaciones Especiales
- **Estudiantes/Egresados**: Deben usar email @tecsup.edu.pe para Google Auth
- **Empresas**: Requieren RUC válido (11 dígitos)
- **Admins**: Perfil siempre completo automáticamente

## 📊 Módulos Desarrollados

### 🔑 Módulo de Autenticación
**Endpoints:**
- `POST /api/auth/register` - Registro manual
- `POST /api/auth/login` - Login con email/contraseña
- `POST /api/auth/google` - Autenticación con Google
- `POST /api/auth/completar-perfil-empresa` - Completar perfil empresa
- `POST /api/auth/completar-perfil-estudiante` - Completar perfil estudiante/egresado
- `GET /api/auth/perfil` - Obtener perfil del usuario
- `GET /api/auth/verificar-perfil` - Verificar estado del perfil
- `POST /api/auth/logout` - Cerrar sesión

**Features:**
- ✅ JWT para autenticación
- ✅ Google OAuth 2.0 integrado
- ✅ Validación de emails institucionales
- ✅ Perfiles diferenciados por rol
- ✅ Middleware de autorización
- ✅ Encriptación de contraseñas

### 💼 Módulo de Ofertas Laborales
**Endpoints:**
- `GET /api/ofertas` - Listar ofertas públicas
- `POST /api/ofertas` - Crear nueva oferta (empresas)
- `GET /api/ofertas/:id` - Obtener oferta específica
- `PUT /api/ofertas/:id` - Actualizar oferta (empresa propietaria)
- `DELETE /api/ofertas/:id` - Eliminar oferta (empresa propietaria)

**Features:**
- ✅ CRUD completo de ofertas
- ✅ Filtros por carrera, tipo, empresa
- ✅ Requisitos personalizables
- ✅ Preguntas adicionales para postulantes
- ✅ Control de acceso por rol

### 📝 Módulo de Postulaciones
**Endpoints:**
- `POST /api/postulaciones` - Crear postulación
- `GET /api/postulaciones/mis-postulaciones` - Ver mis postulaciones (estudiante)
- `GET /api/postulaciones/oferta/:id` - Ver postulaciones de una oferta (empresa)
- `PUT /api/postulaciones/:id/estado` - Cambiar estado de postulación (empresa)

**Features:**
- ✅ Sistema de postulaciones único por oferta
- ✅ Estados: PENDIENTE, ACEPTADA, RECHAZADA
- ✅ Respuestas a preguntas personalizadas
- ✅ Notificaciones de cambio de estado

### 📰 Módulo de Blog
**Endpoints:**
- `GET /api/blog/posts` - Listar posts públicos
- `POST /api/blog/posts` - Crear nuevo post
- `GET /api/blog/posts/:id` - Obtener post específico
- `POST /api/blog/posts/:id/comentarios` - Agregar comentario
- `POST /api/blog/posts/:id/reacciones` - Reaccionar a post

**Features:**
- ✅ Sistema de blog completo
- ✅ Comentarios anidados
- ✅ Sistema de reacciones (like, love, etc.)
- ✅ Categorías de posts
- ✅ Multimedia en posts y comentarios

### 📁 Módulo de Archivos
**Endpoints:**
- `POST /api/upload/cv` - Subir CV (estudiantes/egresados)
- `POST /api/upload/carta` - Subir carta de presentación
- `POST /api/upload/foto-perfil` - Subir foto de perfil
- `POST /api/upload/logo-empresa` - Subir logo empresa

**Features:**
- ✅ Integración con Cloudinary
- ✅ Validación de tipos de archivo
- ✅ Compresión automática de imágenes
- ✅ URLs seguras y optimizadas

### 👨‍💼 Módulo de Administración
**Endpoints:**
- `GET /api/admin/usuarios` - Gestionar usuarios
- `GET /api/admin/estadisticas` - Dashboard de estadísticas
- `PUT /api/admin/usuarios/:id/estado` - Activar/desactivar usuarios
- `DELETE /api/admin/comentarios/:id` - Moderar comentarios

**Features:**
- ✅ Panel de administración completo
- ✅ Gestión de usuarios por rol
- ✅ Moderación de contenido
- ✅ Estadísticas del sistema
- ✅ Búsqueda avanzada de usuarios

## 🗄️ Modelo de Base de Datos

### Entidades Principales
- **Usuario**: Información base de todos los usuarios
- **Estudiante**: Perfil específico para estudiantes/egresados
- **Empresa**: Perfil específico para empresas
- **Oferta**: Ofertas laborales creadas por empresas
- **Postulacion**: Postulaciones de estudiantes a ofertas
- **BlogPost**: Posts del blog
- **Comentario**: Comentarios en posts

### Relaciones Clave
- Usuario 1:1 Estudiante/Empresa (según rol)
- Empresa 1:N Ofertas
- Estudiante N:M Ofertas (a través de Postulaciones)
- BlogPost 1:N Comentarios
- Comentario 1:N Comentarios (anidados)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- Cuenta de Google Cloud (para OAuth)
- Cuenta de Cloudinary

### Variables de Entorno
```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/protalent"

# JWT
JWT_SECRET="tu_jwt_secret_muy_seguro"

# Google OAuth
GOOGLE_CLIENT_ID="tu_google_client_id"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"

# Servidor
PORT=5000
NODE_ENV=development
```

### Comandos de Instalación
```bash
# Instalar dependencias
npm install

# Configurar base de datos
npx prisma migrate dev
npx prisma generate

# Crear usuario admin
node scripts/createAdmin.js

# Crear usuarios de prueba
node scripts/createTestUser.js

# Iniciar servidor
npm start
```

## 🧪 Credenciales de Prueba

### Admin
- **Email**: admin@protalent.com
- **Password**: admin123

### Estudiante
- **Email**: estudiante@tecsup.edu.pe
- **Password**: test123

### Empresa
- **Email**: empresa@test.com
- **Password**: test123

## 📡 API Endpoints Principales

### Autenticación
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/google
GET /api/auth/perfil
```

### Ofertas
```http
GET /api/ofertas
POST /api/ofertas
GET /api/ofertas/:id
PUT /api/ofertas/:id
DELETE /api/ofertas/:id
```

### Postulaciones
```http
POST /api/postulaciones
GET /api/postulaciones/mis-postulaciones
GET /api/postulaciones/oferta/:id
```

### Blog
```http
GET /api/blog/posts
POST /api/blog/posts
GET /api/blog/posts/:id
POST /api/blog/posts/:id/comentarios
```

## 🔒 Seguridad Implementada

- ✅ Autenticación JWT
- ✅ Validación de tokens Google OAuth
- ✅ Middleware de autorización por roles
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Validación de entrada con Joi/Zod
- ✅ Rate limiting en endpoints críticos
- ✅ CORS configurado correctamente
- ✅ Headers de seguridad con Helmet

## 📈 Próximas Funcionalidades

### En Desarrollo
- [ ] Sistema de notificaciones en tiempo real
- [ ] Chat entre empresas y postulantes
- [ ] Sistema de calificaciones y reviews
- [ ] Dashboard de analytics avanzado
- [ ] API de integración con sistemas externos

### Planificado
- [ ] Sistema de recomendaciones IA
- [ ] Matching automático empresa-estudiante
- [ ] Certificaciones y badges
- [ ] Sistema de eventos y webinars
- [ ] Mobile app con React Native

## 🐛 Debugging y Logs

### Logs del Sistema
- Autenticación y autorización
- Operaciones CRUD críticas
- Errores de base de datos
- Uploads de archivos
- Actividad de usuarios

### Herramientas de Debug
- Prisma Studio para base de datos
- Swagger UI para documentación API
- Postman collection incluida
- Logs estructurados con Winston

## 🤝 Contribución

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
refactor: refactorización de código
test: agregar o actualizar tests
```

### Flujo de Desarrollo
1. Fork del repositorio
2. Crear rama feature/nombre-feature
3. Desarrollar y testear
4. Pull request con descripción detallada
5. Code review y merge

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: soporte@protalent.com
- **Documentación**: `/swagger` endpoint
- **Issues**: GitHub Issues

---

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2025  
**Desarrollado por**: Equipo PROTALENT
