// Datos de ubicaciones de Perú
const UBICACIONES_PERU = {
  departamentos: {
    '01': 'Amazonas', '02': 'Áncash', '03': 'Apurímac', '04': 'Arequipa', '05': 'Ayacucho',
    '06': 'Cajamarca', '07': 'Callao', '08': 'Cusco', '09': 'Huancavelica', '10': 'Huánuco',
    '11': 'Ica', '12': 'Junín', '13': 'La Libertad', '14': 'Lambayeque', '15': 'Lima',
    '16': 'Loreto', '17': 'Madre de Dios', '18': 'Moquegua', '19': 'Pasco', '20': 'Piura',
    '21': 'Puno', '22': 'San Martín', '23': 'Tacna', '24': 'Tumbes', '25': 'Ucayali'
  },
  provincias: {
    '01': { '0101': 'Chachapoyas', '0102': 'Bagua', '0103': 'Bongará', '0104': 'Condorcanqui', '0105': 'Luya', '0106': 'Rodríguez de Mendoza', '0107': 'Utcubamba' },
    '02': { '0201': 'Huaraz', '0202': 'Aija', '0203': 'Antonio Raymondi', '0204': 'Asunción', '0205': 'Bolognesi', '0206': 'Carhuaz', '0207': 'Carlos Fermín Fitzcarrald', '0208': 'Casma', '0209': 'Corongo', '0210': 'Huari', '0211': 'Huarmey', '0212': 'Huaylas', '0213': 'Mariscal Luzuriaga', '0214': 'Ocros', '0215': 'Pallasca', '0216': 'Pomabamba', '0217': 'Recuay', '0218': 'Santa', '0219': 'Sihuas', '0220': 'Yungay' },
    '03': { '0301': 'Abancay', '0302': 'Andahuaylas', '0303': 'Antabamba', '0304': 'Aymaraes', '0305': 'Cotabambas', '0306': 'Chincheros', '0307': 'Grau' },
    '04': { '0401': 'Arequipa', '0402': 'Camaná', '0403': 'Caravelí', '0404': 'Castilla', '0405': 'Caylloma', '0406': 'Condesuyos', '0407': 'Islay', '0408': 'La Unión' },
    '05': { '0501': 'Huamanga', '0502': 'Cangallo', '0503': 'Huanca Sancos', '0504': 'Huanta', '0505': 'La Mar', '0506': 'Lucanas', '0507': 'Parinacochas', '0508': 'Páucar del Sara Sara', '0509': 'Sucre', '0510': 'Víctor Fajardo', '0511': 'Vilcas Huamán' },
    '06': { '0601': 'Cajamarca', '0602': 'Cajabamba', '0603': 'Celendín', '0604': 'Chota', '0605': 'Contumazá', '0606': 'Cutervo', '0607': 'Hualgayoc', '0608': 'Jaén', '0609': 'San Ignacio', '0610': 'San Marcos', '0611': 'San Miguel', '0612': 'San Pablo', '0613': 'Santa Cruz' },
    '07': { '0701': 'Callao' },
    '08': { '0801': 'Cusco', '0802': 'Acomayo', '0803': 'Anta', '0804': 'Calca', '0805': 'Canas', '0806': 'Canchis', '0807': 'Chumbivilcas', '0808': 'Espinar', '0809': 'La Convención', '0810': 'Paruro', '0811': 'Paucartambo', '0812': 'Quispicanchi', '0813': 'Urubamba' },
    '09': { '0901': 'Huancavelica', '0902': 'Acobamba', '0903': 'Angaraes', '0904': 'Castrovirreyna', '0905': 'Churcampa', '0906': 'Colcabamba', '0907': 'Huaytará', '0908': 'Tayacaja' },
    '10': { '1001': 'Huánuco', '1002': 'Ambo', '1003': 'Dos de Mayo', '1004': 'Huacaybamba', '1005': 'Huamalíes', '1006': 'Leoncio Prado', '1007': 'Marañón', '1008': 'Pachitea', '1009': 'Puerto Inca', '1010': 'Lauricocha', '1011': 'Yarowilca' },
    '11': { '1101': 'Ica', '1102': 'Chincha', '1103': 'Nazca', '1104': 'Palpa', '1105': 'Pisco' },
    '12': { '1201': 'Huancayo', '1202': 'Concepción', '1203': 'Chanchamayo', '1204': 'Jauja', '1205': 'Junín', '1206': 'Satipo', '1207': 'Tarma', '1208': 'Yauli', '1209': 'Chupaca' },
    '13': { '1301': 'Trujillo', '1302': 'Ascope', '1303': 'Bolívar', '1304': 'Chepén', '1305': 'Julcán', '1306': 'Otuzco', '1307': 'Pacasmayo', '1308': 'Pataz', '1309': 'Sánchez Carrión', '1310': 'Santiago de Chuco', '1311': 'Gran Chimú', '1312': 'Virú' },
    '14': { '1401': 'Chiclayo', '1402': 'Ferreñafe', '1403': 'Lambayeque' },
    '15': { '1501': 'Lima', '1502': 'Barranca', '1503': 'Cajatambo', '1504': 'Canta', '1505': 'Cañete', '1506': 'Huaral', '1507': 'Huarochirí', '1508': 'Huaura', '1509': 'Oyón', '1510': 'Yauyos' },
    '16': { '1601': 'Maynas', '1602': 'Alto Amazonas', '1603': 'Loreto', '1604': 'Mariscal Ramón Castilla', '1605': 'Requena', '1606': 'Ucayali', '1607': 'Datem del Marañón', '1608': 'Putumayo' },
    '17': { '1701': 'Tambopata', '1702': 'Manu', '1703': 'Tahuamanu' },
    '18': { '1801': 'Mariscal Nieto', '1802': 'General Sánchez Cerro', '1803': 'Ilo' },
    '19': { '1901': 'Pasco', '1902': 'Daniel Alcides Carrión', '1903': 'Oxapampa' },
    '20': { '2001': 'Piura', '2002': 'Ayabaca', '2003': 'Huancabamba', '2004': 'Morropón', '2005': 'Paita', '2006': 'Sullana', '2007': 'Talara', '2008': 'Sechura' },
    '21': { '2101': 'Puno', '2102': 'Azángaro', '2103': 'Carabaya', '2104': 'Chucuito', '2105': 'El Collao', '2106': 'Huancané', '2107': 'Lampa', '2108': 'Melgar', '2109': 'Moho', '2110': 'San Antonio de Putina', '2111': 'San Román', '2112': 'Sandia', '2113': 'Yunguyo' },
    '22': { '2201': 'Moyobamba', '2202': 'Bellavista', '2203': 'El Dorado', '2204': 'Huallaga', '2205': 'Lamas', '2206': 'Mariscal Cáceres', '2207': 'Picota', '2208': 'Rioja', '2209': 'San Martín', '2210': 'Tocache' },
    '23': { '2301': 'Tacna', '2302': 'Candarave', '2303': 'Jorge Basadre', '2304': 'Tarata' },
    '24': { '2401': 'Tumbes', '2402': 'Contralmirante Villar', '2403': 'Zarumilla' },
    '25': { '2501': 'Coronel Portillo', '2502': 'Atalaya', '2503': 'Padre Abad', '2504': 'Purús' }
  },
  distritos: {
    '1501': { 
      '150101': 'Lima', '150102': 'Ancón', '150103': 'Ate', '150104': 'Barranco', '150105': 'Breña',
      '150106': 'Carabayllo', '150107': 'Chaclacayo', '150108': 'Chorrillos', '150109': 'Cieneguilla',
      '150110': 'Comas', '150111': 'El Agustino', '150112': 'Independencia', '150113': 'Jesús María',
      '150114': 'La Molina', '150115': 'La Victoria', '150116': 'Lince', '150117': 'Los Olivos',
      '150118': 'Lurigancho', '150119': 'Lurín', '150120': 'Magdalena del Mar', '150121': 'Miraflores',
      '150122': 'Pachacámac', '150123': 'Pucusana', '150124': 'Pueblo Libre', '150125': 'Puente Piedra',
      '150126': 'Punta Hermosa', '150127': 'Punta Negra', '150128': 'Rímac', '150129': 'San Bartolo',
      '150130': 'San Borja', '150131': 'San Isidro', '150132': 'San Juan de Lurigancho',
      '150133': 'San Juan de Miraflores', '150134': 'San Luis', '150135': 'San Martín de Porres',
      '150136': 'San Miguel', '150137': 'Santa Anita', '150138': 'Santa María del Mar',
      '150139': 'Santa Rosa', '150140': 'Santiago de Surco', '150141': 'Surquillo',
      '150142': 'Villa El Salvador', '150143': 'Villa María del Triunfo'
    },
    '1301': { 
      '130101': 'Trujillo', '130102': 'El Porvenir', '130103': 'Florencia de Mora', '130104': 'Huanchaco',
      '130105': 'La Esperanza', '130106': 'Laredo', '130107': 'Moche', '130108': 'Poroto',
      '130109': 'Salaverry', '130110': 'Simbal', '130111': 'Victor Larco Herrera'
    },
    '0401': { 
      '040101': 'Arequipa', '040102': 'Alto Selva Alegre', '040103': 'Cayma', '040104': 'Cerro Colorado',
      '040105': 'Characato', '040106': 'Chiguata', '040107': 'Jacobo Hunter', '040108': 'José Luis Bustamante y Rivero',
      '040109': 'La Joya', '040110': 'Mariano Melgar', '040111': 'Miraflores', '040112': 'Mollebaya',
      '040113': 'Paucarpata', '040114': 'Pocsi', '040115': 'Polobaya', '040116': 'Quequeña',
      '040117': 'Sabandía', '040118': 'Sachaca', '040119': 'San Juan de Siguas', '040120': 'San Juan de Tarucani',
      '040121': 'Santa Isabel de Siguas', '040122': 'Santa Rita de Siguas', '040123': 'Socabaya',
      '040124': 'Tiabaya', '040125': 'Uchumayo', '040126': 'Vitor', '040127': 'Yanahuara',
      '040128': 'Yarabamba', '040129': 'Yura'
    }
  }
};

// Función para obtener nombres de ubicación
const getUbicacionNombres = (departamentoId, provinciaId, distritoId) => {
  const departamento = UBICACIONES_PERU.departamentos[departamentoId] || 'Departamento no especificado';
  const provincia = UBICACIONES_PERU.provincias[departamentoId]?.[provinciaId] || 'Provincia no especificada';
  const distrito = UBICACIONES_PERU.distritos[provinciaId]?.[distritoId] || 'Distrito no especificado';
  
  return {
    departamento,
    provincia,
    distrito,
    completo: `${departamento}, ${provincia}, ${distrito}`
  };
};

// Función para obtener todos los departamentos
const getDepartamentos = () => {
  return Object.entries(UBICACIONES_PERU.departamentos).map(([id, nombre]) => ({
    id,
    nombre
  }));
};

// Función para obtener provincias por departamento
const getProvinciasPorDepartamento = (departamentoId) => {
  const provincias = UBICACIONES_PERU.provincias[departamentoId];
  if (!provincias) return [];
  
  return Object.entries(provincias).map(([id, nombre]) => ({
    id,
    nombre
  }));
};

// Función para obtener distritos por provincia
const getDistritosPorProvincia = (provinciaId) => {
  const distritos = UBICACIONES_PERU.distritos[provinciaId];
  if (!distritos) return [];
  
  return Object.entries(distritos).map(([id, nombre]) => ({
    id,
    nombre
  }));
};

module.exports = {
  UBICACIONES_PERU,
  getUbicacionNombres,
  getDepartamentos,
  getProvinciasPorDepartamento,
  getDistritosPorProvincia
};
