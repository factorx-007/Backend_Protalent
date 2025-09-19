const { prisma } = require('../config/database');

exports.crearEmpresa = async (req, res) => {
  try {
    const nuevaEmpresa = await prisma.empresa.create({
      data: req.body
    });
    res.status(201).json({ mensaje: 'Empresa creada', empresa: nuevaEmpresa });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear empresa', detalle: error.message });
  }
};

exports.obtenerEmpresas = async (req, res) => {
  try {
    const empresas = await prisma.empresa.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        }
      }
    });
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empresas', detalle: error.message });
  }
};

exports.obtenerEmpresaPorId = async (req, res) => {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        }
      }
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar empresa', detalle: error.message });
  }
};

exports.actualizarEmpresa = async (req, res) => {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const empresaActualizada = await prisma.empresa.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        }
      }
    });
    res.json({ mensaje: 'Empresa actualizada', empresa: empresaActualizada });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar empresa', detalle: error.message });
  }
};

exports.eliminarEmpresa = async (req, res) => {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    await prisma.empresa.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ mensaje: 'Empresa eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar empresa', detalle: error.message });
  }
};

// Obtener perfil de empresa del usuario autenticado
exports.obtenerPerfilEmpresa = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    
    const empresa = await prisma.empresa.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        }
      }
    });
    
    if (!empresa) {
      return res.status(404).json({ error: 'Perfil de empresa no encontrado' });
    }
    
    res.json({ empresa });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil de empresa', detalle: error.message });
  }
};

// Actualizar perfil de empresa del usuario autenticado
exports.actualizarPerfilEmpresa = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { ruc, nombre_empresa, rubro, descripcion, direccion, telefono } = req.body;
    
    const empresa = await prisma.empresa.findUnique({
      where: { usuarioId }
    });
    
    if (!empresa) {
      return res.status(404).json({ error: 'Perfil de empresa no encontrado' });
    }
    
    const empresaActualizada = await prisma.empresa.update({
      where: { usuarioId },
      data: {
        ruc,
        nombre_empresa,
        rubro,
        descripcion,
        direccion,
        telefono
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        }
      }
    });
    
    res.json({ mensaje: 'Perfil de empresa actualizado', empresa: empresaActualizada });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil de empresa', detalle: error.message });
  }
};
