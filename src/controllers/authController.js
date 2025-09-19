//src/controllers/authController.js
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { OAuth2Client } = require('google-auth-library');
const generateToken = require('../utils/generateToken');

// Inicializar cliente de Google OAuth
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Registro
const register = async (req, res) => {
  console.log('📝 Datos recibidos en register:', req.body);
  
  const { nombre, email, password, rol, carrera, tipo, ruc, nombre_empresa, rubro } = req.body;

  // Validaciones básicas
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ 
      error: 'Nombre, email, password y rol son obligatorios',
      received: { nombre: !!nombre, email: !!email, password: !!password, rol: !!rol }
    });
  }

  try {
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) return res.status(400).json({ error: 'El email ya está en uso' });

    // Validaciones específicas por rol
    if ((rol === 'estudiante' || rol === 'egresado') && !carrera) {
      return res.status(400).json({ error: 'La carrera es obligatoria para estudiantes y egresados' });
    }

    if (rol === 'empresa' && (!ruc || !nombre_empresa || !rubro)) {
      return res.status(400).json({ error: 'RUC, nombre de empresa y rubro son obligatorios para empresas' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario base
    const user = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol: rol.toUpperCase(),
        perfilCompleto: true
      }
    });

    let perfil = null;

    // Crear perfil específico según el rol
    if (rol === 'estudiante' || rol === 'egresado') {
      perfil = await prisma.estudiante.create({
        data: {
          usuarioId: user.id,
          carrera,
          tipo: (tipo || rol).toUpperCase(),
          año_egreso: req.body.anio_egreso || req.body.año_egreso
        }
      });
    } else if (rol === 'empresa') {
      perfil = await prisma.empresa.create({
        data: {
          usuarioId: user.id,
          ruc,
          nombre_empresa,
          rubro
        }
      });
    }

    // Generar token para el usuario registrado
    const token = generateToken({ id: user.id, rol: user.rol });

    res.status(201).json({ 
      mensaje: 'Usuario registrado con éxito', 
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        perfilCompleto: true // Si llegó hasta aquí, el perfil está completo
      },
      perfil
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el registro', detalle: err.message });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que el usuario tenga contraseña (no sea usuario de Google sin contraseña)
    if (!user.password) {
      return res.status(400).json({ 
        error: 'Esta cuenta fue creada con Google. Por favor, inicia sesión con Google.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Para admin, no necesita perfil específico
    let tienePerfilCompleto = true;
    let perfilEspecifico = null;

    if (user.rol === 'ADMIN') {
      // Los admins siempre tienen perfil completo
      tienePerfilCompleto = true;
    } else {
      // Para otros roles, verificar si tiene perfil específico
      if (user.rol === 'EMPRESA') {
        perfilEspecifico = await prisma.empresa.findUnique({ where: { usuarioId: user.id } });
      } else if (user.rol === 'ESTUDIANTE' || user.rol === 'EGRESADO') {
        perfilEspecifico = await prisma.estudiante.findUnique({ where: { usuarioId: user.id } });
      }
      tienePerfilCompleto = !!perfilEspecifico;
    }

    // Actualizar perfilCompleto si es necesario
    if (user.perfilCompleto !== tienePerfilCompleto) {
      await prisma.usuario.update({
        where: { id: user.id },
        data: { perfilCompleto: tienePerfilCompleto }
      });
    }

    const token = generateToken({ id: user.id, rol: user.rol });

    // Determinar redirección según el rol
    let redirectTo = '/dashboard';
    if (user.rol === 'ADMIN') {
      redirectTo = '/admin/dashboard';
    } else if (!tienePerfilCompleto) {
      if (user.rol === 'EMPRESA') {
        redirectTo = '/auth/completar-perfil-empresa';
      } else {
        redirectTo = '/auth/completar-perfil-estudiante';
      }
    } else {
      // Si el perfil está completo, redirigir según el rol
      if (user.rol === 'EMPRESA') {
        redirectTo = '/empresas/dashboard';
      } else {
        redirectTo = '/dashboard';
      }
    }

    res.json({
      mensaje: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        perfilCompleto: tienePerfilCompleto,
      },
      redirectTo
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión', detalle: err.message });
  }
};

// Ruta protegida para ver perfil
const perfil = async (req, res) => {
  try {
    // Asegúrate de que req.user.id exista y sea válido (viene del middleware verifyToken)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'No autorizado o ID de usuario no encontrado en token' });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estudiante: {
          select: {
            id: true,
            carrera: true,
            año_egreso: true,
            telefono: true,
            tipo: true,
            cv: true,
            foto_perfil: true
          }
        },
        empresa: {
          select: {
            id: true,
            ruc: true,
            nombre_empresa: true,
            rubro: true,
            descripcion: true,
            direccion: true,
            telefono: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado con el ID proporcionado' });
    }

    res.json({ 
      mensaje: 'Perfil del usuario', 
      user
    });
  } catch (err) {
    console.error("Error en /perfil:", err); // Loguear el error en backend es útil
    res.status(500).json({ error: 'Error al obtener perfil', detalle: err.message });
  }
};

// Cerrar sesión
const logout = (req, res) => {
  // En frontend, basta con borrar el token
  res.json({ mensaje: 'Sesión cerrada. Por favor, elimina el token del cliente.' });
};

// Login/Registro con Google
const googleAuth = async (req, res) => {
  try {
    const { credential, rol } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Token de Google requerido' });
    }

    if (!rol || !['estudiante', 'egresado', 'empresa'].includes(rol)) {
      return res.status(400).json({ error: 'Rol válido requerido: estudiante, egresado, empresa' });
    }

    // ✅ VERIFICAR TOKEN CON GOOGLE (SEGURIDAD)
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      console.error('Error verificando token de Google:', error);
      return res.status(401).json({ error: 'Token de Google inválido' });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name: nombre, picture } = payload;

    // Verificar que el email esté verificado por Google
    if (!payload.email_verified) {
      return res.status(400).json({ error: 'Email no verificado por Google' });
    }

    // Para estudiantes y egresados, verificar que sea email institucional de TECSUP
    if ((rol === 'estudiante' || rol === 'egresado') && !email.endsWith('@tecsup.edu.pe')) {
      return res.status(400).json({ 
        error: 'Los estudiantes y egresados deben usar su correo institucional @tecsup.edu.pe' 
      });
    }

    // Buscar usuario existente por googleId o email
    let user = await prisma.usuario.findFirst({ 
      where: {
        OR: [
          { googleId },
          { email }
        ]
      }
    });

    if (user) {
      // Usuario existente - actualizar información si es necesario
      const updateData = {};
      
      // Vincular cuenta existente con Google si no está vinculada
      if (!user.googleId) {
        updateData.googleId = googleId;
      }
      
      // Actualizar nombre si es diferente
      if (user.nombre !== nombre) {
        updateData.nombre = nombre;
      }
      
      // Si el rol es diferente, actualizar y marcar perfil como incompleto
      if (user.rol.toLowerCase() !== rol.toLowerCase()) {
        updateData.rol = rol.toUpperCase();
        updateData.perfilCompleto = false;
      }
      
      // Si hay algo que actualizar, lo hacemos
      if (Object.keys(updateData).length > 0) {
        user = await prisma.usuario.update({
          where: { id: user.id },
          data: updateData
        });
      }
    } else {
      // Nuevo usuario - crear con Google
      user = await prisma.usuario.create({
        data: {
          nombre,
          email,
          googleId,
          rol: rol.toUpperCase(),
          password: null, // No tiene contraseña porque usa Google
          perfilCompleto: false // Siempre false para nuevos usuarios con Google
        }
      });
    }

    // Verificar si tiene perfil específico completo
    let perfilEspecifico = null;
    if (user.rol === 'EMPRESA') {
      perfilEspecifico = await prisma.empresa.findUnique({ where: { usuarioId: user.id } });
    } else if (user.rol === 'ESTUDIANTE' || user.rol === 'EGRESADO') {
      perfilEspecifico = await prisma.estudiante.findUnique({ where: { usuarioId: user.id } });
    }

    // Actualizar perfilCompleto basado en si tiene perfil específico
    const tienePerfilCompleto = !!perfilEspecifico;
    if (user.perfilCompleto !== tienePerfilCompleto) {
      await prisma.usuario.update({
        where: { id: user.id },
        data: { perfilCompleto: tienePerfilCompleto }
      });
      user.perfilCompleto = tienePerfilCompleto;
    }

    const token = generateToken({ id: user.id, rol: user.rol });

    // Determinar la URL de redirección
    let redirectTo = '/dashboard';
    if (!tienePerfilCompleto) {
      if (user.rol === 'EMPRESA') {
        redirectTo = '/auth/completar-perfil-empresa';
      } else {
        redirectTo = '/perfil/completar';
      }
    } else {
      // Si el perfil está completo, redirigir según el rol
      if (user.rol === 'ADMIN') {
        redirectTo = '/admin/dashboard';
      } else if (user.rol === 'EMPRESA') {
        redirectTo = '/empresas/dashboard';
      } else {
        redirectTo = '/dashboard';
      }
    }

    res.json({
      mensaje: 'Autenticación con Google exitosa',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        perfilCompleto: tienePerfilCompleto,
        picture // URL de la foto de Google
      },
      necesitaCompletarPerfil: !tienePerfilCompleto,
      redirectTo,
      esNuevoUsuario: !perfilEspecifico
    });
  } catch (error) {
    console.error('Error en Google Auth:', error);
    res.status(500).json({ error: 'Error en autenticación con Google', detalle: error.message });
  }
};

// Completar perfil de empresa (después de Google Auth)
const completarPerfilEmpresa = async (req, res) => {
  try {
    // Aceptar tanto snake_case como camelCase
    const { 
      ruc, 
      nombre_empresa, 
      nombreEmpresa, 
      rubro, 
      descripcion, 
      direccion, 
      telefono 
    } = req.body;
    
    // Usar el valor que esté disponible
    const nombreEmpresaFinal = nombre_empresa || nombreEmpresa;
    const usuarioId = req.user.id;

    // Verificar que sea una empresa
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario || usuario.rol !== 'EMPRESA') {
      return res.status(403).json({ error: 'Solo empresas pueden completar este perfil' });
    }

    // Verificar que no tenga ya un perfil
    const empresaExistente = await prisma.empresa.findUnique({ where: { usuarioId } });
    if (empresaExistente) {
      return res.status(400).json({ error: 'El perfil de empresa ya existe' });
    }

    // Validar RUC (opcional: integrar con API de SUNAT)
    if (!ruc || ruc.length !== 11) {
      return res.status(400).json({ error: 'RUC debe tener 11 dígitos' });
    }

    // Validar que el nombre de la empresa esté presente
    if (!nombreEmpresaFinal) {
      return res.status(400).json({ error: 'El nombre de la empresa es obligatorio' });
    }

    // Crear perfil de empresa
    const empresa = await prisma.empresa.create({
      data: {
        usuarioId,
        ruc,
        nombre_empresa: nombreEmpresaFinal,
        rubro,
        descripcion,
        direccion,
        telefono
      }
    });

    // Marcar perfil como completo
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { perfilCompleto: true }
    });

    res.status(201).json({
      mensaje: 'Perfil de empresa completado exitosamente',
      empresa
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al completar perfil de empresa', detalle: error.message });
  }
};

// Completar perfil de estudiante/egresado (después de Google Auth)
const completarPerfilEstudiante = async (req, res) => {
  try {
    const { 
      carrera, 
      anio_egreso, 
      año_egreso,
      telefono, 
      ciclo,
      direccion 
    } = req.body;
    
    const usuarioId = req.user.id;
    const anioEgresoFinal = anio_egreso || año_egreso;

    // Verificar que sea un estudiante o egresado
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario || (usuario.rol !== 'ESTUDIANTE' && usuario.rol !== 'EGRESADO')) {
      return res.status(403).json({ error: 'Solo estudiantes y egresados pueden completar este perfil' });
    }

    // Verificar que no tenga ya un perfil
    const estudianteExistente = await prisma.estudiante.findUnique({ where: { usuarioId } });
    if (estudianteExistente) {
      return res.status(400).json({ error: 'El perfil de estudiante ya existe' });
    }

    // Validaciones
    if (!carrera) {
      return res.status(400).json({ error: 'La carrera es obligatoria' });
    }

    // Para egresados, el año de egreso es obligatorio
    if (usuario.rol === 'EGRESADO' && !anioEgresoFinal) {
      return res.status(400).json({ error: 'El año de egreso es obligatorio para egresados' });
    }

    // Crear perfil de estudiante
    const estudiante = await prisma.estudiante.create({
      data: {
        usuarioId,
        carrera,
        año_egreso: anioEgresoFinal ? parseInt(anioEgresoFinal) : null,
        telefono,
        tipo: usuario.rol === 'EGRESADO' ? 'EGRESADO' : 'ESTUDIANTE'
      }
    });

    // Marcar perfil como completo
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { perfilCompleto: true }
    });

    res.status(201).json({
      mensaje: 'Perfil de estudiante completado exitosamente',
      estudiante,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        perfilCompleto: true
      }
    });
  } catch (error) {
    console.error('Error al completar perfil de estudiante:', error);
    res.status(500).json({ error: 'Error al completar perfil de estudiante', detalle: error.message });
  }
};

// Verificar estado del perfil del usuario
const verificarEstadoPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        perfilCompleto: true,
        estudiante: {
          select: {
            id: true,
            carrera: true,
            año_egreso: true,
            telefono: true,
            tipo: true,
            cv: true,
            foto_perfil: true
          }
        },
        empresa: {
          select: {
            id: true,
            ruc: true,
            nombre_empresa: true,
            rubro: true,
            descripcion: true,
            direccion: true,
            telefono: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Para admin, siempre tiene perfil completo
    let tienePerfilCompleto = true;
    if (user.rol === 'ADMIN') {
      tienePerfilCompleto = true;
    } else {
      tienePerfilCompleto = !!(user.estudiante || user.empresa);
    }
    
    // Actualizar perfilCompleto si es necesario
    if (user.perfilCompleto !== tienePerfilCompleto) {
      await prisma.usuario.update({
        where: { id: userId },
        data: { perfilCompleto: tienePerfilCompleto }
      });
      user.perfilCompleto = tienePerfilCompleto;
    }

    res.json({
      mensaje: 'Estado del perfil del usuario',
      user,
      perfilCompleto: tienePerfilCompleto,
      necesitaCompletarPerfil: !tienePerfilCompleto,
      redirectTo: !tienePerfilCompleto ? 
        (user.rol === 'EMPRESA' ? '/auth/completar-perfil-empresa' : '/auth/completar-perfil-estudiante') : 
        null
    });
  } catch (error) {
    console.error('Error al verificar estado del perfil:', error);
    res.status(500).json({ error: 'Error al verificar estado del perfil', detalle: error.message });
  }
};

// Obtener usuarios públicos (para mostrar en blog) - NUEVO ENDPOINT
const obtenerUsuariosPublicos = async (req, res) => {
  try {
    const { limit = 10, offset = 0, search = '' } = req.query;
    
    console.log(`Obteniendo usuarios públicos: limit=${limit}, offset=${offset}, search='${search}'`);
    
    // Construir condiciones de búsqueda
    const whereConditions = {
      rol: { not: 'ADMIN' } // Excluir administradores
    };
    
    // Si hay término de búsqueda, agregar filtro por nombre o email
    if (search && search.trim()) {
      whereConditions.OR = [
        { nombre: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }
    
    // Primero intentamos sin includes para ver si funciona
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where: whereConditions,
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          perfilCompleto: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.usuario.count({ where: whereConditions })
    ]);
    
    console.log(`Encontrados ${total} usuarios públicos`);
    
    res.json({
      usuarios: usuarios,
      total: total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: (parseInt(offset) + parseInt(limit)) < total
    });
    
  } catch (error) {
    console.error('Error en obtenerUsuariosPublicos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener usuarios',
      detalle: error.message
    });
  }
};

// Buscar usuarios - NUEVO ENDPOINT
const buscarUsuarios = async (req, res) => {
  try {
    const { q: search, limit = 20 } = req.query;
    
    if (!search || search.trim().length < 2) {
      return res.status(400).json({ 
        error: 'El término de búsqueda debe tener al menos 2 caracteres' 
      });
    }
    
    console.log(`Buscando usuarios con término: '${search}'`);
    
    const usuarios = await prisma.usuario.findMany({
      where: {
        rol: { not: 'ADMIN' }, // Excluir administradores
        OR: [
          { nombre: { contains: search.trim(), mode: 'insensitive' } },
          { email: { contains: search.trim(), mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true
      },
      orderBy: { nombre: 'asc' },
      take: parseInt(limit)
    });
    
    console.log(`Encontrados ${usuarios.length} usuarios en búsqueda`);
    
    res.json({
      usuarios: usuarios,
      total: usuarios.length,
      searchTerm: search.trim()
    });
    
  } catch (error) {
    console.error('Error en buscarUsuarios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al buscar usuarios',
      detalle: error.message
    });
  }
};

module.exports = { 
    register, 
    login,
    perfil,
    logout, 
    googleAuth,
    completarPerfilEmpresa,
    completarPerfilEstudiante,
    verificarEstadoPerfil,
    obtenerUsuariosPublicos,
    buscarUsuarios
};
