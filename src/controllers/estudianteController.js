// src/controllers/estudianteController.js
const { prisma } = require('../config/database');

// Controlador básico para estudiantes
const crearEstudiante = async (req, res) => {
  try {
    res.json({ message: 'Función en desarrollo - usar Prisma' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
};

const obtenerEstudiantes = async (req, res) => {
  try {
    const estudiantes = await prisma.estudiante.findMany({ 
      take: 10,
      include: {
        usuario: {
          select: { nombre: true, email: true }
        }
      }
    });
    res.json({ estudiantes });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
};

const actualizarEstudiante = async (req, res) => {
  try {
    res.json({ message: 'Función en desarrollo - usar Prisma' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
};

const eliminarEstudiante = async (req, res) => {
  try {
    res.json({ message: 'Función en desarrollo - usar Prisma' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
};

const obtenerEstudiantePorId = async (req, res) => {
  try {
    res.json({ message: 'Función en desarrollo - usar Prisma' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
};

module.exports = {
  crearEstudiante,
  obtenerEstudiantes,
  actualizarEstudiante,
  eliminarEstudiante,
  obtenerEstudiantePorId
};