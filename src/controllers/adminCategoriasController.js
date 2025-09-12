const { Categoria } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      attributes: ['id', 'nombre', 'descripcion', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        categorias
      }
    });

  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener categorías'
    });
  }
};

// Obtener una categoría por ID
const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        categoria
      }
    });

  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener categoría'
    });
  }
};

// Crear nueva categoría
const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la categoría es requerido'
      });
    }

    // Verificar si ya existe una categoría con ese nombre
    const categoriaExistente = await Categoria.findOne({
      where: { nombre: nombre.trim() }
    });

    if (categoriaExistente) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una categoría con ese nombre'
      });
    }

    const nuevaCategoria = await Categoria.create({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null
    });

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: {
        categoria: nuevaCategoria
      }
    });

  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear categoría'
    });
  }
};

// Actualizar categoría
const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la categoría es requerido'
      });
    }

    // Verificar si ya existe otra categoría con ese nombre
    const categoriaExistente = await Categoria.findOne({
      where: { 
        nombre: nombre.trim(),
        id: { [Op.ne]: id }
      }
    });

    if (categoriaExistente) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe otra categoría con ese nombre'
      });
    }

    await categoria.update({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null
    });

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: {
        categoria
      }
    });

  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al actualizar categoría'
    });
  }
};

// Eliminar categoría
const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    await categoria.destroy();

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar categoría'
    });
  }
};

module.exports = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
};
