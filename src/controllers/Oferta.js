const { prisma } = require('../config/database');

// Controlador básico para ofertas
const obtenerOfertas = async (req, res) => {
  try {
    const ofertas = await prisma.oferta.findMany({ 
      take: 10,
      include: {
        empresa: {
          select: { nombre_empresa: true }
        }
      }
    });
    res.json({ ofertas });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
};

const crearOferta = async (req, res) => {
  try {
    res.json({ message: 'Función en desarrollo - usar Prisma' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
};

module.exports = {
  obtenerOfertas,
  crearOferta
};