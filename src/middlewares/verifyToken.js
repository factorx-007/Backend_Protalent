//src/middlewares/verifyToken
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Cargar información completa del usuario con sus relaciones
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
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

    req.user = user; // Ahora tienes acceso a req.user con toda la información
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;
