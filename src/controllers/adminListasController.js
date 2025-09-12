const { Usuario, Empresa, Estudiante, Oferta, Postulacion } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las empresas
const getEmpresas = async (req, res) => {
  try {
    const empresas = await Empresa.findAll({
      include: [
        {
          model: Usuario,
          attributes: ['email', 'createdAt']
        }
      ],
      attributes: ['id', 'nombreEmpresa', 'descripcion', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        empresas: empresas.map(empresa => ({
          id: empresa.id,
          nombre: empresa.nombreEmpresa, // Cambiar a 'nombre' para consistencia
          descripcion: empresa.descripcion,
          email: empresa.Usuario?.email,
          fechaRegistro: empresa.createdAt,
          createdAt: empresa.createdAt,
          updatedAt: empresa.updatedAt
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener empresas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener empresas'
    });
  }
};

// Obtener todas las ofertas
const getOfertas = async (req, res) => {
  try {
    const ofertas = await Oferta.findAll({
      include: [
        {
          model: Empresa,
          attributes: ['nombreEmpresa']
        }
      ],
      attributes: ['id', 'titulo', 'descripcion', 'requisitos', 'duracion', 'requiereCV', 'requiereCarta', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        ofertas: ofertas.map(oferta => ({
          id: oferta.id,
          titulo: oferta.titulo,
          descripcion: oferta.descripcion,
          requisitos: oferta.requisitos,
          duracion: oferta.duracion,
          ubicacion: 'No especificada', // Campo que no existe en el modelo
          salario: null, // Campo que no existe en el modelo
          estado: 'activa', // Campo que no existe en el modelo, asumimos activa
          fechaPublicacion: oferta.createdAt,
          fechaLimite: null, // Campo que no existe en el modelo
          requiereCV: oferta.requiereCV,
          requiereCarta: oferta.requiereCarta,
          Empresa: {
            nombre: oferta.Empresa?.nombreEmpresa
          },
          createdAt: oferta.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener ofertas'
    });
  }
};

// Obtener todas las postulaciones
const getPostulaciones = async (req, res) => {
  try {
    const postulaciones = await Postulacion.findAll({
      include: [
        {
          model: Oferta,
          attributes: ['titulo'],
          include: [
            {
              model: Empresa,
              attributes: ['nombreEmpresa']
            }
          ]
        }
      ],
      attributes: ['id', 'mensaje', 'estado', 'usuarioId', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // Obtener información de usuarios por separado
    const usuariosIds = postulaciones.map(p => p.usuarioId);
    const usuarios = await Usuario.findAll({
      where: { id: usuariosIds },
      include: [
        {
          model: Estudiante,
          attributes: ['carrera']
        }
      ],
      attributes: ['id', 'nombre', 'email']
    });

    const usuariosMap = {};
    usuarios.forEach(usuario => {
      usuariosMap[usuario.id] = usuario;
    });

    res.json({
      success: true,
      data: {
        postulaciones: postulaciones.map(postulacion => ({
          id: postulacion.id,
          mensaje: postulacion.mensaje,
          estado: postulacion.estado,
          fechaPostulacion: postulacion.createdAt,
          Oferta: {
            titulo: postulacion.Oferta?.titulo,
            Empresa: {
              nombre: postulacion.Oferta?.Empresa?.nombreEmpresa
            }
          },
          Estudiante: {
            nombre: usuariosMap[postulacion.usuarioId]?.nombre,
            apellido: '', // No existe apellido en el modelo
            carrera: usuariosMap[postulacion.usuarioId]?.Estudiante?.carrera,
            Usuario: {
              email: usuariosMap[postulacion.usuarioId]?.email
            }
          },
          createdAt: postulacion.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtener postulaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener postulaciones'
    });
  }
};

module.exports = {
  getEmpresas,
  getOfertas,
  getPostulaciones
};
