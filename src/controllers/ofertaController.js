const { prisma } = require('../config/database');

// Datos de ubicaciones de Perú (copiados del controlador de ubicaciones)
const UBICACIONES_PERU = {
  departamentos: {
    '01': 'Amazonas', '02': 'Áncash', '03': 'Apurímac', '04': 'Arequipa', '05': 'Ayacucho',
    '06': 'Cajamarca', '07': 'Callao', '08': 'Cusco', '09': 'Huancavelica', '10': 'Huánuco',
    '11': 'Ica', '12': 'Junín', '13': 'La Libertad', '14': 'Lambayeque', '15': 'Lima',
    '16': 'Loreto', '17': 'Madre de Dios', '18': 'Moquegua', '19': 'Pasco', '20': 'Piura',
    '21': 'Puno', '22': 'San Martín', '23': 'Tacna', '24': 'Tumbes', '25': 'Ucayali'
  },
  provincias: {
    '15': { '1501': 'Lima', '1502': 'Barranca', '1503': 'Cajatambo', '1504': 'Canta', '1505': 'Cañete',
            '1506': 'Huaral', '1507': 'Huarochirí', '1508': 'Huaura', '1509': 'Oyón', '1510': 'Yauyos' },
    '13': { '1301': 'Trujillo', '1302': 'Ascope', '1303': 'Bolívar', '1304': 'Chepén', '1305': 'Julcán',
            '1306': 'Otuzco', '1307': 'Pacasmayo', '1308': 'Pataz', '1309': 'Sánchez Carrión', 
            '1310': 'Santiago de Chuco', '1311': 'Gran Chimú', '1312': 'Virú' },
    '04': { '0401': 'Arequipa', '0402': 'Camaná', '0403': 'Caravelí', '0404': 'Castilla', '0405': 'Caylloma',
            '0406': 'Condesuyos', '0407': 'Islay', '0408': 'La Unión' }
  },
  distritos: {
    '1501': { '150101': 'Lima', '150102': 'Ancón', '150103': 'Ate', '150104': 'Barranco', '150105': 'Breña',
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
              '150142': 'Villa El Salvador', '150143': 'Villa María del Triunfo' },
    '1301': { '130101': 'Trujillo', '130102': 'El Porvenir', '130103': 'Florencia de Mora', '130104': 'Huanchaco',
              '130105': 'La Esperanza', '130106': 'Laredo', '130107': 'Moche', '130108': 'Poroto',
              '130109': 'Salaverry', '130110': 'Simbal', '130111': 'Victor Larco Herrera' },
    '0401': { '040101': 'Arequipa', '040102': 'Alto Selva Alegre', '040103': 'Cayma', '040104': 'Cerro Colorado',
              '040105': 'Characato', '040106': 'Chiguata', '040107': 'Jacobo Hunter', '040108': 'José Luis Bustamante y Rivero',
              '040109': 'La Joya', '040110': 'Mariano Melgar', '040111': 'Miraflores', '040112': 'Mollebaya',
              '040113': 'Paucarpata', '040114': 'Pocsi', '040115': 'Polobaya', '040116': 'Quequeña',
              '040117': 'Sabandía', '040118': 'Sachaca', '040119': 'San Juan de Siguas', '040120': 'San Juan de Tarucani',
              '040121': 'Santa Isabel de Siguas', '040122': 'Santa Rita de Siguas', '040123': 'Socabaya',
              '040124': 'Tiabaya', '040125': 'Uchumayo', '040126': 'Vitor', '040127': 'Yanahuara',
              '040128': 'Yarabamba', '040129': 'Yura' }
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

exports.crearOferta = async (req, res) => {
  try {
    console.log('📝 Datos recibidos para crear oferta:', req.body);
    console.log('👤 Usuario autenticado:', req.user);
    
    const { titulo, descripcion, duracion, requiereCV, requiereCarta, requisitos, preguntas, modalidad, salario, departamento, provincia, distrito } = req.body;

    // Validar que el usuario sea una empresa
    if (req.user.rol !== 'EMPRESA') {
      return res.status(403).json({
        success: false,
        error: 'Solo las empresas pueden crear ofertas'
      });
    }

    // Obtener la empresa del usuario autenticado
    const empresa = await prisma.empresa.findUnique({
      where: { usuarioId: req.user.id }
    });

    if (!empresa) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró el perfil de empresa asociado al usuario'
      });
    }

    // Crear la oferta con Prisma
    const nuevaOferta = await prisma.oferta.create({
      data: {
        titulo,
        descripcion,
        duracion,
        requiereCV: requiereCV || true,
        requiereCarta: requiereCarta || false,
        empresaId: empresa.id
      }
    });

    // Crear requisitos si existen
    if (requisitos && Array.isArray(requisitos) && requisitos.length > 0) {
      const requisitosACrear = requisitos.map((req, index) => ({
        ofertaId: nuevaOferta.id,
        requisito: req.descripcion || req.requisito,
        descripcion: req.descripcion,
        tipo: req.tipo || 'obligatorio',
        categoria: req.categoria || 'otro',
        orden: req.orden || index + 1
      }));
      
      await prisma.requisitoOferta.createMany({
        data: requisitosACrear
      });
    }

    // Crear preguntas si existen
    if (preguntas && Array.isArray(preguntas) && preguntas.length > 0) {
      // Mapear tipos de pregunta del frontend a Prisma
      const mapearTipoPregunta = (tipo) => {
        const mapeo = {
          'text': 'TEXT',
          'number': 'NUMBER', 
          'select': 'SELECT',
          'textarea': 'TEXTAREA',
          'test': 'SELECT' // Mapear 'test' a 'SELECT' para compatibilidad
        };
        return mapeo[tipo] || 'TEXT';
      };

      const preguntasACrear = preguntas.map((preg, index) => ({
        ofertaId: nuevaOferta.id,
        pregunta: preg.texto || preg.pregunta,
        tipo: mapearTipoPregunta(preg.tipo),
        opciones: (preg.tipo === 'select' || preg.tipo === 'test') ? preg.opciones : null,
        requerida: preg.requerida || false,
        orden: index + 1
      }));
      
      await prisma.preguntaOferta.createMany({
        data: preguntasACrear
      });
    }

    // Obtener la oferta completa con relaciones
    const ofertaCompleta = await prisma.oferta.findUnique({
      where: { id: nuevaOferta.id },
      include: {
        requisitos: {
          orderBy: { orden: 'asc' }
        },
        preguntas: {
          orderBy: { orden: 'asc' }
        },
        empresa: {
          select: {
            id: true,
            nombre_empresa: true,
            rubro: true
          }
        }
      }
    });

    res.status(201).json({ 
      success: true,
      mensaje: 'Oferta creada exitosamente', 
      data: ofertaCompleta 
    });
  } catch (error) {
    console.error('Error al crear oferta:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor al crear la oferta' 
    });
  }
};

exports.obtenerOfertas = async (req, res) => {
  try {
    const ofertas = await Oferta.findAll({
      include: [
        {
          model: Empresa,
          attributes: ['id', 'nombreEmpresa', 'rubro']
        },
        {
          model: RequisitoOferta,
          attributes: ['id', 'descripcion', 'tipo', 'categoria', 'orden'],
          order: [['orden', 'ASC']]
        }
      ]
    });

    // Transformar las ofertas para incluir nombres de ubicación
    const ofertasConUbicacion = ofertas.map(oferta => {
      const ofertaData = oferta.toJSON();
      
      // Obtener nombres de ubicación
      const ubicacion = getUbicacionNombres(ofertaData.departamento, ofertaData.provincia, ofertaData.distrito);
      
      return {
        ...ofertaData,
        ubicacionNombres: ubicacion
      };
    });

    res.json(ofertasConUbicacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ofertas', detalle: error.message });
  }
};

exports.obtenerOfertaPorId = async (req, res) => {
  try {
    const oferta = await Oferta.findByPk(req.params.id, {
      include: [
        {
          model: Empresa,
          attributes: ['id', 'nombreEmpresa', 'rubro']
        },
        {
          model: RequisitoOferta,
          attributes: ['id', 'descripcion', 'tipo', 'categoria', 'orden'],
          order: [['orden', 'ASC']]
        },
        {
          model: PreguntaOferta,
          attributes: ['id', 'pregunta', 'tipo', 'opciones', 'requerida', 'orden'],
          order: [['orden', 'ASC']]
        }
      ]
    });
    if (!oferta) return res.status(404).json({ error: 'Oferta no encontrada' });
    
    // Agregar nombres de ubicación
    const ofertaData = oferta.toJSON();
    const ubicacion = getUbicacionNombres(ofertaData.departamento, ofertaData.provincia, ofertaData.distrito);
    
    const ofertaConUbicacion = {
      ...ofertaData,
      ubicacionNombres: ubicacion
    };
    
    res.json(ofertaConUbicacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar oferta', detalle: error.message });
  }
};

exports.obtenerOfertasPorEmpresa = async (req, res) => {
  try {
    const { empresaId } = req.params;
    
    const ofertas = await Oferta.findAll({
      where: { empresaId },
      include: [
        {
          model: Empresa,
          attributes: ['id', 'nombreEmpresa', 'rubro']
        },
        {
          model: RequisitoOferta,
          attributes: ['id', 'descripcion', 'tipo', 'categoria', 'orden'],
          order: [['orden', 'ASC']]
        },
        {
          model: PreguntaOferta,
          attributes: ['id', 'pregunta', 'tipo', 'opciones', 'requerida', 'orden'],
          order: [['orden', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transformar las ofertas para incluir nombres de ubicación
    const ofertasConUbicacion = ofertas.map(oferta => {
      const ofertaData = oferta.toJSON();
      
      // Obtener nombres de ubicación
      const ubicacion = getUbicacionNombres(ofertaData.departamento, ofertaData.provincia, ofertaData.distrito);
      
      return {
        ...ofertaData,
        ubicacionNombres: ubicacion
      };
    });

    res.json(ofertasConUbicacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ofertas de la empresa', detalle: error.message });
  }
};

exports.actualizarOferta = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, duracion, requiereCV, requiereCarta, requisitos } = req.body;

    const oferta = await Oferta.findByPk(id);
    if (!oferta) return res.status(404).json({ error: 'Oferta no encontrada' });

    // Actualizar campos de la oferta
    await oferta.update({
      titulo,
      descripcion,
      duracion,
      requiereCV,
      requiereCarta
    });

    // Si se envían requisitos, actualizar completamente
    if (requisitos && Array.isArray(requisitos)) {
      // Eliminar requisitos existentes
      await RequisitoOferta.destroy({ where: { ofertaId: id } });

      // Crear nuevos requisitos
      if (requisitos.length > 0) {
        const requisitosACrear = requisitos.map((req, index) => ({
          ofertaId: id,
          descripcion: req.descripcion,
          tipo: req.tipo || 'obligatorio',
          categoria: req.categoria || 'otro',
          orden: req.orden || index + 1
        }));

        await RequisitoOferta.bulkCreate(requisitosACrear);
      }
    }

    // Retornar oferta actualizada con requisitos
    const ofertaActualizada = await Oferta.findByPk(id, {
      include: [{
        model: RequisitoOferta,
        order: [['orden', 'ASC']]
      }]
    });

    res.json({ 
      mensaje: 'Oferta actualizada exitosamente', 
      oferta: ofertaActualizada 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar oferta', detalle: error.message });
  }
};

exports.eliminarOferta = async (req, res) => {
  try {
    const oferta = await Oferta.findByPk(req.params.id);
    if (!oferta) return res.status(404).json({ error: 'Oferta no encontrada' });

    // Los requisitos se eliminarán automáticamente por CASCADE (si se configura en la BD)
    // O podemos eliminarlos manualmente:
    await RequisitoOferta.destroy({ where: { ofertaId: req.params.id } });
    
    await oferta.destroy();
    res.json({ mensaje: 'Oferta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar oferta', detalle: error.message });
  }
};

