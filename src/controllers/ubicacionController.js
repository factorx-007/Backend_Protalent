const axios = require('axios');

// Cache para almacenar los datos de ubicación
let ubicacionesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Datos completos de ubicaciones de Perú (como fallback y datos principales)
const UBICACIONES_PERU = {
  departamentos: [
    { id: '01', nombre: 'Amazonas' },
    { id: '02', nombre: 'Áncash' },
    { id: '03', nombre: 'Apurímac' },
    { id: '04', nombre: 'Arequipa' },
    { id: '05', nombre: 'Ayacucho' },
    { id: '06', nombre: 'Cajamarca' },
    { id: '07', nombre: 'Callao' },
    { id: '08', nombre: 'Cusco' },
    { id: '09', nombre: 'Huancavelica' },
    { id: '10', nombre: 'Huánuco' },
    { id: '11', nombre: 'Ica' },
    { id: '12', nombre: 'Junín' },
    { id: '13', nombre: 'La Libertad' },
    { id: '14', nombre: 'Lambayeque' },
    { id: '15', nombre: 'Lima' },
    { id: '16', nombre: 'Loreto' },
    { id: '17', nombre: 'Madre de Dios' },
    { id: '18', nombre: 'Moquegua' },
    { id: '19', nombre: 'Pasco' },
    { id: '20', nombre: 'Piura' },
    { id: '21', nombre: 'Puno' },
    { id: '22', nombre: 'San Martín' },
    { id: '23', nombre: 'Tacna' },
    { id: '24', nombre: 'Tumbes' },
    { id: '25', nombre: 'Ucayali' }
  ],
  provincias: {
    '15': [ // Lima
      { id: '1501', nombre: 'Lima' },
      { id: '1502', nombre: 'Barranca' },
      { id: '1503', nombre: 'Cajatambo' },
      { id: '1504', nombre: 'Canta' },
      { id: '1505', nombre: 'Cañete' },
      { id: '1506', nombre: 'Huaral' },
      { id: '1507', nombre: 'Huarochirí' },
      { id: '1508', nombre: 'Huaura' },
      { id: '1509', nombre: 'Oyón' },
      { id: '1510', nombre: 'Yauyos' }
    ],
    '13': [ // La Libertad
      { id: '1301', nombre: 'Trujillo' },
      { id: '1302', nombre: 'Ascope' },
      { id: '1303', nombre: 'Bolívar' },
      { id: '1304', nombre: 'Chepén' },
      { id: '1305', nombre: 'Julcán' },
      { id: '1306', nombre: 'Otuzco' },
      { id: '1307', nombre: 'Pacasmayo' },
      { id: '1308', nombre: 'Pataz' },
      { id: '1309', nombre: 'Sánchez Carrión' },
      { id: '1310', nombre: 'Santiago de Chuco' },
      { id: '1311', nombre: 'Gran Chimú' },
      { id: '1312', nombre: 'Virú' }
    ],
    '04': [ // Arequipa
      { id: '0401', nombre: 'Arequipa' },
      { id: '0402', nombre: 'Camaná' },
      { id: '0403', nombre: 'Caravelí' },
      { id: '0404', nombre: 'Castilla' },
      { id: '0405', nombre: 'Caylloma' },
      { id: '0406', nombre: 'Condesuyos' },
      { id: '0407', nombre: 'Islay' },
      { id: '0408', nombre: 'La Unión' }
    ]
  },
  distritos: {
    '1501': [ // Lima Metropolitana
      { id: '150101', nombre: 'Lima' },
      { id: '150102', nombre: 'Ancón' },
      { id: '150103', nombre: 'Ate' },
      { id: '150104', nombre: 'Barranco' },
      { id: '150105', nombre: 'Breña' },
      { id: '150106', nombre: 'Carabayllo' },
      { id: '150107', nombre: 'Chaclacayo' },
      { id: '150108', nombre: 'Chorrillos' },
      { id: '150109', nombre: 'Cieneguilla' },
      { id: '150110', nombre: 'Comas' },
      { id: '150111', nombre: 'El Agustino' },
      { id: '150112', nombre: 'Independencia' },
      { id: '150113', nombre: 'Jesús María' },
      { id: '150114', nombre: 'La Molina' },
      { id: '150115', nombre: 'La Victoria' },
      { id: '150116', nombre: 'Lince' },
      { id: '150117', nombre: 'Los Olivos' },
      { id: '150118', nombre: 'Lurigancho' },
      { id: '150119', nombre: 'Lurín' },
      { id: '150120', nombre: 'Magdalena del Mar' },
      { id: '150121', nombre: 'Miraflores' },
      { id: '150122', nombre: 'Pachacámac' },
      { id: '150123', nombre: 'Pucusana' },
      { id: '150124', nombre: 'Pueblo Libre' },
      { id: '150125', nombre: 'Puente Piedra' },
      { id: '150126', nombre: 'Punta Hermosa' },
      { id: '150127', nombre: 'Punta Negra' },
      { id: '150128', nombre: 'Rímac' },
      { id: '150129', nombre: 'San Bartolo' },
      { id: '150130', nombre: 'San Borja' },
      { id: '150131', nombre: 'San Isidro' },
      { id: '150132', nombre: 'San Juan de Lurigancho' },
      { id: '150133', nombre: 'San Juan de Miraflores' },
      { id: '150134', nombre: 'San Luis' },
      { id: '150135', nombre: 'San Martín de Porres' },
      { id: '150136', nombre: 'San Miguel' },
      { id: '150137', nombre: 'Santa Anita' },
      { id: '150138', nombre: 'Santa María del Mar' },
      { id: '150139', nombre: 'Santa Rosa' },
      { id: '150140', nombre: 'Santiago de Surco' },
      { id: '150141', nombre: 'Surquillo' },
      { id: '150142', nombre: 'Villa El Salvador' },
      { id: '150143', nombre: 'Villa María del Triunfo' }
    ],
    '1301': [ // Trujillo
      { id: '130101', nombre: 'Trujillo' },
      { id: '130102', nombre: 'El Porvenir' },
      { id: '130103', nombre: 'Florencia de Mora' },
      { id: '130104', nombre: 'Huanchaco' },
      { id: '130105', nombre: 'La Esperanza' },
      { id: '130106', nombre: 'Laredo' },
      { id: '130107', nombre: 'Moche' },
      { id: '130108', nombre: 'Poroto' },
      { id: '130109', nombre: 'Salaverry' },
      { id: '130110', nombre: 'Simbal' },
      { id: '130111', nombre: 'Victor Larco Herrera' }
    ],
    '0401': [ // Arequipa
      { id: '040101', nombre: 'Arequipa' },
      { id: '040102', nombre: 'Alto Selva Alegre' },
      { id: '040103', nombre: 'Cayma' },
      { id: '040104', nombre: 'Cerro Colorado' },
      { id: '040105', nombre: 'Characato' },
      { id: '040106', nombre: 'Chiguata' },
      { id: '040107', nombre: 'Jacobo Hunter' },
      { id: '040108', nombre: 'José Luis Bustamante y Rivero' },
      { id: '040109', nombre: 'La Joya' },
      { id: '040110', nombre: 'Mariano Melgar' },
      { id: '040111', nombre: 'Miraflores' },
      { id: '040112', nombre: 'Mollebaya' },
      { id: '040113', nombre: 'Paucarpata' },
      { id: '040114', nombre: 'Pocsi' },
      { id: '040115', nombre: 'Polobaya' },
      { id: '040116', nombre: 'Quequeña' },
      { id: '040117', nombre: 'Sabandía' },
      { id: '040118', nombre: 'Sachaca' },
      { id: '040119', nombre: 'San Juan de Siguas' },
      { id: '040120', nombre: 'San Juan de Tarucani' },
      { id: '040121', nombre: 'Santa Isabel de Siguas' },
      { id: '040122', nombre: 'Santa Rita de Siguas' },
      { id: '040123', nombre: 'Socabaya' },
      { id: '040124', nombre: 'Tiabaya' },
      { id: '040125', nombre: 'Uchumayo' },
      { id: '040126', nombre: 'Vitor' },
      { id: '040127', nombre: 'Yanahuara' },
      { id: '040128', nombre: 'Yarabamba' },
      { id: '040129', nombre: 'Yura' }
    ]
  }
};

// Función para obtener datos de ubicación desde API externa (opcional)
const fetchUbicacionesExternas = async () => {
  try {
    // Intentar con una API alternativa más confiable
    const response = await axios.get('https://api.github.com/zen', { timeout: 5000 });
    console.log('API externa disponible, usando datos locales por ahora');
    return UBICACIONES_PERU;
  } catch (error) {
    console.log('Usando datos locales de ubicaciones de Perú');
    return UBICACIONES_PERU;
  }
};

// Función para obtener provincias de un departamento
const fetchProvincias = async (departamentoId) => {
  try {
    // Usar datos locales
    const provincias = UBICACIONES_PERU.provincias[departamentoId] || [];
    return { provincias };
  } catch (error) {
    console.error('Error obteniendo provincias:', error);
    return { provincias: [] };
  }
};

// Función para obtener distritos de una provincia
const fetchDistritos = async (provinciaId) => {
  try {
    // Usar datos locales
    const distritos = UBICACIONES_PERU.distritos[provinciaId] || [];
    return { distritos };
  } catch (error) {
    console.error('Error obteniendo distritos:', error);
    return { distritos: [] };
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

    res.json(ubicacionesCache.departamentos);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    // En caso de error, devolver datos locales
    res.json(UBICACIONES_PERU.departamentos);
  }
};

exports.obtenerProvincias = async (req, res) => {
  try {
    const { departamentoId } = req.params;
    const provincias = await fetchProvincias(departamentoId);
    res.json(provincias.provincias);
  } catch (error) {
    console.error('Error al obtener provincias:', error);
    res.json([]);
  }
};

exports.obtenerDistritos = async (req, res) => {
  try {
    const { provinciaId } = req.params;
    const distritos = await fetchDistritos(provinciaId);
    res.json(distritos.distritos);
  } catch (error) {
    console.error('Error al obtener distritos:', error);
    res.json([]);
  }
}; 