const { Usuario, Empresa, Estudiante, Oferta, Postulacion } = require('../models');
const { Op } = require('sequelize');

// Obtener estadísticas del dashboard de admin
const getDashboardStats = async (req, res) => {
  try {
    console.log('getDashboardStats called - Admin user:', req.adminUser?.nombre);

    // Contar totales
    const totalUsuarios = await Usuario.count();
    const totalEmpresas = await Empresa.count();
    const totalOfertas = await Oferta.count();
    const totalPostulaciones = await Postulacion.count();

    // Obtener últimos 5 usuarios registrados con información de empresa/estudiante si la tienen
    const ultimosUsuarios = await Usuario.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Empresa,
          required: false,
          attributes: ['nombreEmpresa', 'descripcion']
        },
        {
          model: Estudiante,
          required: false,
          attributes: ['carrera', 'anioIngreso']
        }
      ],
      attributes: ['id', 'nombre', 'email', 'rol', 'createdAt']
    });

    // Formatear la información de los últimos usuarios
    const usuariosFormateados = ultimosUsuarios.map(usuario => {
      let descripcion = '';
      let tipoUsuario = '';

      if (usuario.rol === 'empresa' && usuario.Empresa) {
        tipoUsuario = 'Empresa';
        descripcion = `${usuario.nombre} de ${usuario.Empresa.nombreEmpresa} se registró como empresa`;
      } else if (usuario.rol === 'estudiante' && usuario.Estudiante) {
        tipoUsuario = 'Estudiante';
        descripcion = `${usuario.nombre} se registró como estudiante${usuario.Estudiante.carrera ? ` de ${usuario.Estudiante.carrera}` : ''}`;
      } else {
        tipoUsuario = usuario.rol === 'empresa' ? 'Empresa' : 'Estudiante';
        descripcion = `${usuario.nombre} se registró como ${tipoUsuario.toLowerCase()}`;
      }
      
      return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        tipoUsuario,
        fechaRegistro: usuario.createdAt,
        descripcion
      };
    });

    res.json({
      success: true,
      data: {
        totales: {
          usuarios: totalUsuarios,
          empresas: totalEmpresas,
          ofertas: totalOfertas,
          postulaciones: totalPostulaciones
        },
        ultimosUsuarios: usuariosFormateados
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

module.exports = {
  getDashboardStats
};
