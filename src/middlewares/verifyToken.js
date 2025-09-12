//src/middlewares/verifyToken
const jwt = require('jsonwebtoken');
const { Usuario, Estudiante, Empresa } = require('../models');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Cargar información completa del usuario con sus relaciones
    const user = await Usuario.findByPk(decoded.id, {
      attributes: ['id', 'nombre', 'email', 'rol', 'perfilCompleto'],
      include: [
        {
          model: Estudiante,
          required: false,
          attributes: ['id', 'carrera', 'anio_egreso', 'telefono', 'tipo', 'cv', 'foto_perfil']
        },
        {
          model: Empresa,
          required: false,
          attributes: ['id', 'ruc', 'nombreEmpresa', 'rubro', 'descripcion', 'direccion', 'telefono']
        }
      ]
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
