// src/middlewares/requireCompleteProfile.js
const { Usuario, Estudiante, Empresa } = require('../models');

const requireCompleteProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await Usuario.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si tiene perfil específico
    let perfilEspecifico = null;
    if (user.rol === 'empresa') {
      perfilEspecifico = await Empresa.findOne({ where: { usuarioId: userId } });
    } else if (user.rol === 'estudiante' || user.rol === 'egresado') {
      perfilEspecifico = await Estudiante.findOne({ where: { usuarioId: userId } });
    }

    if (!perfilEspecifico) {
      const redirectTo = user.rol === 'empresa' ? 
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
      await user.update({ perfilCompleto: true });
    }

    next();
  } catch (error) {
    console.error('Error en requireCompleteProfile:', error);
    res.status(500).json({ error: 'Error al verificar perfil' });
  }
};

module.exports = requireCompleteProfile;
