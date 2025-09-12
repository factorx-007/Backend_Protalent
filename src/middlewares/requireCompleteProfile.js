// src/middlewares/requireCompleteProfile.js
const { prisma } = require('../config/database');

const requireCompleteProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        empresa: true,
        estudiante: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si tiene perfil específico
    let perfilEspecifico = null;
    if (user.rol === 'EMPRESA') {
      perfilEspecifico = user.empresa;
    } else if (user.rol === 'ESTUDIANTE' || user.rol === 'EGRESADO') {
      perfilEspecifico = user.estudiante;
    }

    if (!perfilEspecifico) {
      const redirectTo = user.rol === 'EMPRESA' ? 
        '/auth/completar-perfil-empresa' : 
        '/perfil/completar';
        
      return res.status(403).json({ 
        error: 'Perfil incompleto', 
        mensaje: 'Debes completar tu perfil para acceder a esta función',
        redirectTo,
        requiresProfile: true
      });
    }

    // Actualizar perfilCompleto si es necesario
    if (!user.perfilCompleto) {
      await prisma.usuario.update({
        where: { id: userId },
        data: { perfilCompleto: true }
      });
    }

    next();
  } catch (error) {
    console.error('Error en requireCompleteProfile:', error);
    res.status(500).json({ error: 'Error al verificar perfil' });
  }
};

module.exports = requireCompleteProfile;
