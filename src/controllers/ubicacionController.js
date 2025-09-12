const axios = require('axios');
const { 
  getDepartamentos, 
  getProvinciasPorDepartamento, 
  getDistritosPorProvincia 
} = require('../utils/ubicaciones');

// Cache para almacenar los datos de ubicación
let ubicacionesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Función para obtener datos de ubicación desde API externa (opcional)
const fetchUbicacionesExternas = async () => {
  try {
    // Intentar con una API alternativa más confiable
    const response = await axios.get('https://api.github.com/zen', { timeout: 5000 });
    console.log('API externa disponible, usando datos locales por ahora');
    return getDepartamentos();
  } catch (error) {
    console.log('Usando datos locales de ubicaciones de Perú');
    return getDepartamentos();
  }
};

exports.obtenerDepartamentos = async (req, res) => {
  try {
    // Verificar si el cache está válido
    if (!ubicacionesCache || !cacheTimestamp || (Date.now() - cacheTimestamp) > CACHE_DURATION) {
      const data = await fetchUbicacionesExternas();
      ubicacionesCache = data;
      cacheTimestamp = Date.now();
    }

    res.json(ubicacionesCache);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    // En caso de error, devolver datos locales
    res.json(getDepartamentos());
  }
};

exports.obtenerProvincias = async (req, res) => {
  try {
    const { departamentoId } = req.params;
    const provincias = getProvinciasPorDepartamento(departamentoId);
    res.json(provincias);
  } catch (error) {
    console.error('Error al obtener provincias:', error);
    res.json([]);
  }
};

exports.obtenerDistritos = async (req, res) => {
  try {
    const { provinciaId } = req.params;
    const distritos = getDistritosPorProvincia(provinciaId);
    res.json(distritos);
  } catch (error) {
    console.error('Error al obtener distritos:', error);
    res.json([]);
  }
}; 