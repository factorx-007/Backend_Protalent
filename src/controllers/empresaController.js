const { Empresa } = require('../models');

exports.crearEmpresa = async (req, res) => {
  try {
    const nuevaEmpresa = await Empresa.create(req.body);
    res.status(201).json({ mensaje: 'Empresa creada', empresa: nuevaEmpresa });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear empresa', detalle: error.message });
  }
};

exports.obtenerEmpresas = async (req, res) => {
  try {
    const empresas = await Empresa.findAll();
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empresas' });
  }
};

exports.obtenerEmpresaPorId = async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar empresa' });
  }
};

exports.actualizarEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    await empresa.update(req.body);
    res.json({ mensaje: 'Empresa actualizada', empresa });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar empresa' });
  }
};

exports.eliminarEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    await empresa.destroy();
    res.json({ mensaje: 'Empresa eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar empresa' });
  }
};
