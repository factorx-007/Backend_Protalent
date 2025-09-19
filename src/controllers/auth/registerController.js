const bcrypt = require('bcryptjs');
const { prisma } = require('../../config/database');
const generateToken = require('../../utils/generateToken');

// Registro tradicional
const register = async (req, res) => {
  console.log('📝 Datos recibidos en register:', req.body);
  
  const { nombre, email, password, rol, carrera, tipo, ruc, nombre_empresa, rubro, anio_egreso } = req.body;

  // Validaciones básicas
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ 
      error: 'Nombre, email, password y rol son obligatorios',
      received: { nombre: !!nombre, email: !!email, password: !!password, rol: !!rol }
    });
  }

  // Validar formato de email para estudiantes/egresados
  if ((rol === 'estudiante' || rol === 'egresado') && !email.endsWith('@tecsup.edu.pe')) {
    return res.status(400).json({ 
      error: 'Los estudiantes y egresados deben usar su email institucional (@tecsup.edu.pe)' 
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

    // Validar año de egreso para egresados
    if (rol === 'egresado' && !anio_egreso) {
      return res.status(400).json({ error: 'El año de egreso es obligatorio para egresados' });
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
          tipo: rol.toUpperCase(),
          año_egreso: rol === 'egresado' ? parseInt(anio_egreso) : null
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
      success: true,
      mensaje: 'Usuario registrado con éxito', 
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        perfilCompleto: true
      },
      perfil
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error en el registro', detalle: err.message });
  }
};

module.exports = { register };
