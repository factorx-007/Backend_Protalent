# Migración de Sequelize a Prisma + PostgreSQL

## Resumen de Cambios

Este proyecto ha sido migrado de **Sequelize + MySQL** a **Prisma + PostgreSQL**, incluyendo funcionalidades adicionales del sistema de blog avanzado.

## Nuevas Funcionalidades Agregadas

### Sistema de Blog Mejorado
- **BlogPostMedia**: Soporte para multimedia (imágenes, videos, audio)
- **BlogPostReaction**: Sistema de reacciones (like, dislike, love, etc.)
- **ComentarioMedia**: Multimedia en comentarios
- **ComentarioReaction**: Reacciones en comentarios
- **Comentarios anidados**: Respuestas a comentarios

### Mejoras en el Sistema Base
- Soporte completo para roles (ESTUDIANTE, EGRESADO, EMPRESA, ADMIN)
- Sistema de preguntas y respuestas en ofertas mejorado
- Mejores relaciones entre modelos

## Pasos de Migración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copia `.env.example` a `.env` y configura:
```bash
cp .env.example .env
```

Configurar `.env`:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/protalent_db?schema=public"

# JWT Configuration
JWT_SECRET="your-jwt-secret-key-here"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Environment
NODE_ENV="development"

# Server Configuration
PORT=5000
```

### 3. Generar Cliente de Prisma
```bash
npm run db:generate
```

### 4. Ejecutar Migraciones
```bash
# Para desarrollo (crea migración inicial)
npx prisma migrate dev --name init

# Para producción
npm run db:migrate
```

### 5. Ejecutar Seeding (Opcional)
```bash
npm run db:seed
```

### 6. Verificar la Base de Datos
```bash
# Abrir Prisma Studio para ver los datos
npm run db:studio
```

## Comandos Disponibles

- `npm run dev` - Iniciar servidor en desarrollo
- `npm run start` - Iniciar servidor en producción
- `npm run db:generate` - Generar cliente de Prisma
- `npm run db:migrate` - Ejecutar migraciones en producción
- `npm run db:studio` - Abrir Prisma Studio
- `npm run db:reset` - Resetear base de datos (⚠️ CUIDADO: Borra todos los datos)
- `npm run db:seed` - Ejecutar seeding de datos iniciales

## Cambios en el Código

### Modelos Eliminados
- Archivos en `src/models/` (ya no necesarios con Prisma)
- `src/config/db.js` (reemplazado por `src/config/database.js`)

### Archivos Modificados
- `src/controllers/authController.js` - Migrado a Prisma
- `src/server.js` - Usa nueva configuración de BD
- `package.json` - Nuevas dependencias y scripts

### Nuevos Archivos
- `prisma/schema.prisma` - Esquema de base de datos
- `src/config/database.js` - Configuración de Prisma
- `src/scripts/seed.js` - Script de seeding
- `.env.example` - Variables de entorno de ejemplo

## Diferencias Principales con el Proyecto A

### Funcionalidades Adicionales en PROTALENT:
1. **Sistema de multimedia en blog posts**
2. **Sistema de reacciones completo**
3. **Comentarios anidados**
4. **Multimedia en comentarios**
5. **Sistema de chat (Socket.IO)**
6. **Más tipos de reacciones**

### Estructura de Tablas Nuevas:
- `BlogPostMedias` - Multimedia de posts
- `BlogPostReacciones` - Reacciones de posts
- `ComentarioMedias` - Multimedia de comentarios  
- `ComentarioReacciones` - Reacciones de comentarios

## Verificación Post-Migración

### 1. Verificar Conexión
```bash
npm run dev
```
Debe mostrar: `✅ Conexión a PostgreSQL establecida correctamente con Prisma`

### 2. Verificar Tablas
```bash
npm run db:studio
```
Debe mostrar todas las tablas en Prisma Studio

### 3. Probar Endpoints
- POST `/api/auth/register` - Registro de usuarios
- POST `/api/auth/login` - Login
- GET `/api/auth/perfil` - Obtener perfil (requiere token)

## Solución de Problemas

### Error de Conexión a BD
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar la cadena de conexión en .env
echo $DATABASE_URL
```

### Error de Migración
```bash
# Resetear migraciones (⚠️ Borra datos)
npm run db:reset

# Regenerar cliente
npm run db:generate
```

### Error de Dependencias
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install
```

## Notas Importantes

1. **PostgreSQL vs MySQL**: Algunos tipos de datos pueden comportarse diferente
2. **Case Sensitivity**: PostgreSQL es case-sensitive para nombres de tablas
3. **Enums**: Los enums están mapeados correctamente en el schema
4. **Relaciones**: Todas las relaciones han sido preservadas y mejoradas
5. **Indices**: Prisma maneja automáticamente los índices necesarios

## Siguientes Pasos

1. Actualizar controladores restantes (blog, ofertas, empresas, etc.)
2. Migrar sistema de chat si es necesario
3. Actualizar tests para usar Prisma
4. Verificar y optimizar queries complejas