const { prisma } = require('../config/database');
const { getUbicacionNombres } = require('../utils/ubicaciones');

exports.crearOferta = async (req, res) => {
  try {
    console.log('📝 Datos recibidos para crear oferta:', req.body);
    console.log('👤 Usuario autenticado:', req.user);
    
    const { titulo, descripcion, duracion, estado, modalidad, ubicacion, salario, requiereCV, requiereCarta, requisitos, preguntas, departamento, provincia, distrito } = req.body;

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

    // Preparar datos de ubicación si se proporcionan
    let ubicacionTexto = null;
    if (departamento || provincia || distrito) {
      // Si se envían IDs de ubicación, convertir a texto legible
      if (departamento && provincia && distrito) {
        try {
          const ubicacionInfo = await getUbicacionNombres(departamento, provincia, distrito);
          ubicacionTexto = `${ubicacionInfo.distrito}, ${ubicacionInfo.provincia}, ${ubicacionInfo.departamento}`;
        } catch (error) {
          console.warn('Error al obtener nombres de ubicación:', error);
          ubicacionTexto = ubicacion; // Usar ubicacion directa si existe
        }
      } else {
        ubicacionTexto = ubicacion; // Usar ubicacion directa si existe
      }
    }

    // Crear la oferta con Prisma
    const ofertaData = {
      titulo,
      descripcion,
      duracion,
      estado: estado?.toUpperCase() || 'PUBLICADA',
      modalidad: modalidad?.toUpperCase() || 'TIEMPO_COMPLETO',
      ubicacion: ubicacionTexto,
      salario,
      requiereCV: requiereCV ?? true,
      requiereCarta: requiereCarta ?? false,
      empresaId: empresa.id
    };
    
    console.log('📋 [crearOferta] Datos finales para crear oferta:', ofertaData);
    
    const nuevaOferta = await prisma.oferta.create({
      data: ofertaData
    });
    
    console.log('✅ [crearOferta] Oferta creada exitosamente:', nuevaOferta);

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
    const ofertas = await prisma.oferta.findMany({
      include: {
        empresa: {
          select: {
            id: true,
            nombre_empresa: true,
            rubro: true
          }
        },
        requisitos: {
          select: {
            id: true,
            requisito: true,
            descripcion: true,
            tipo: true,
            categoria: true,
            orden: true
          },
          orderBy: { orden: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transformar las ofertas para incluir nombres de ubicación
    const ofertasConUbicacion = ofertas.map(oferta => {
      // Obtener nombres de ubicación
      const ubicacion = getUbicacionNombres(oferta.departamento, oferta.provincia, oferta.distrito);
      
      return {
        ...oferta,
        ubicacionNombres: ubicacion
      };
    });

    res.json({
      success: true,
      data: ofertasConUbicacion
    });
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener ofertas', 
      detalle: error.message 
    });
  }
};

exports.obtenerOfertaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const oferta = await prisma.oferta.findUnique({
      where: { id: parseInt(id) },
      include: {
        empresa: {
          select: {
            id: true,
            nombre_empresa: true,
            rubro: true
          }
        },
        requisitos: {
          select: {
            id: true,
            requisito: true,
            descripcion: true,
            tipo: true,
            categoria: true,
            orden: true
          },
          orderBy: { orden: 'asc' }
        },
        preguntas: {
          select: {
            id: true,
            pregunta: true,
            tipo: true,
            opciones: true,
            requerida: true,
            orden: true
          },
          orderBy: { orden: 'asc' }
        }
      }
    });
    
    if (!oferta) {
      return res.status(404).json({ 
        success: false,
        error: 'Oferta no encontrada' 
      });
    }
    
    // Agregar nombres de ubicación
    const ubicacion = getUbicacionNombres(oferta.departamento, oferta.provincia, oferta.distrito);
    
    const ofertaConUbicacion = {
      ...oferta,
      ubicacionNombres: ubicacion
    };
    
    res.json({
      success: true,
      data: ofertaConUbicacion
    });
  } catch (error) {
    console.error('Error al buscar oferta:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al buscar oferta', 
      detalle: error.message 
    });
  }
};

exports.obtenerOfertasPorEmpresa = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      q = '', 
      estado,
      modalidad,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    console.log('🔍 [obtenerOfertasPorEmpresa] Parámetros recibidos:', {
      empresaId,
      page,
      limit,
      q,
      estado,
      modalidad,
      sortBy,
      sortOrder
    });

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Construir el objeto de filtrado
    const whereClause = {
      empresaId: parseInt(empresaId)
    };

    // Aplicar filtros si existen
    if (estado && estado !== 'todos') {
      whereClause.estado = estado;
    }

    if (modalidad && modalidad !== 'todos') {
      whereClause.modalidad = modalidad;
    }

    // Búsqueda por texto
    if (q) {
      whereClause.OR = [
        { titulo: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } }
      ];
    }

    console.log('🔍 [obtenerOfertasPorEmpresa] WhereClause construido:', whereClause);

    // Obtener el total de ofertas para la paginación
    const total = await prisma.oferta.count({ where: whereClause });
    const totalPages = Math.ceil(total / limitNumber);

    console.log('📊 [obtenerOfertasPorEmpresa] Estadísticas de consulta:', {
      total,
      totalPages,
      pageNumber,
      limitNumber,
      skip
    });

    // Obtener las ofertas con paginación y filtros
    const ofertas = await prisma.oferta.findMany({
      where: whereClause,
      include: {
        empresa: {
          select: {
            id: true,
            nombre_empresa: true,
            rubro: true
          }
        },
        requisitos: {
          select: {
            id: true,
            requisito: true,
            descripcion: true,
            tipo: true,
            categoria: true,
            orden: true
          },
          orderBy: { orden: 'asc' }
        },
        preguntas: {
          select: {
            id: true,
            pregunta: true,
            tipo: true,
            opciones: true,
            requerida: true,
            orden: true
          },
          orderBy: { orden: 'asc' }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNumber
    });

    console.log('📦 [obtenerOfertasPorEmpresa] Ofertas obtenidas de la BD:', {
      cantidad: ofertas.length,
      ofertas: ofertas.map(o => ({
        id: o.id,
        titulo: o.titulo,
        estado: o.estado,
        modalidad: o.modalidad,
        ubicacion: o.ubicacion,
        salario: o.salario,
        duracion: o.duracion,
        createdAt: o.createdAt
      }))
    });

    // Transformar las ofertas para incluir nombres de ubicación
    const ofertasConUbicacion = ofertas.map(oferta => ({
      ...oferta,
      ubicacionNombres: getUbicacionNombres(oferta.departamento, oferta.provincia, oferta.distrito)
    }));

    console.log('✅ [obtenerOfertasPorEmpresa] Respuesta final enviada:', {
      success: true,
      totalOfertas: ofertasConUbicacion.length,
      total,
      totalPages,
      currentPage: pageNumber
    });

    res.json({
      success: true,
      ofertas: ofertasConUbicacion,
      total,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber
    });
  } catch (error) {
    console.error('Error al obtener ofertas de la empresa:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener ofertas de la empresa', 
      detalle: error.message 
    });
  }
};

exports.actualizarOferta = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, duracion, estado, modalidad, ubicacion, salario, requiereCV, requiereCarta, requisitos, preguntas, departamento, provincia, distrito } = req.body;

    // Verificar que la oferta existe
    const ofertaExistente = await prisma.oferta.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!ofertaExistente) {
      return res.status(404).json({ 
        success: false,
        error: 'Oferta no encontrada' 
      });
    }

    // Preparar datos de ubicación si se proporcionan
    let ubicacionTexto = undefined;
    if (departamento || provincia || distrito) {
      if (departamento && provincia && distrito) {
        try {
          const ubicacionInfo = await getUbicacionNombres(departamento, provincia, distrito);
          ubicacionTexto = `${ubicacionInfo.distrito}, ${ubicacionInfo.provincia}, ${ubicacionInfo.departamento}`;
        } catch (error) {
          console.warn('Error al obtener nombres de ubicación:', error);
          ubicacionTexto = ubicacion;
        }
      } else {
        ubicacionTexto = ubicacion;
      }
    }

    // Preparar datos de actualización (solo incluir campos que se enviaron)
    const dataToUpdate = {};
    if (titulo !== undefined) dataToUpdate.titulo = titulo;
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion;
    if (duracion !== undefined) dataToUpdate.duracion = duracion;
    if (estado !== undefined) dataToUpdate.estado = estado?.toUpperCase();
    if (modalidad !== undefined) dataToUpdate.modalidad = modalidad?.toUpperCase();
    if (ubicacionTexto !== undefined) dataToUpdate.ubicacion = ubicacionTexto;
    if (salario !== undefined) dataToUpdate.salario = salario;
    if (requiereCV !== undefined) dataToUpdate.requiereCV = requiereCV;
    if (requiereCarta !== undefined) dataToUpdate.requiereCarta = requiereCarta;

    // Actualizar campos de la oferta
    const ofertaActualizada = await prisma.oferta.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    // Si se envían requisitos, actualizar completamente
    if (requisitos && Array.isArray(requisitos)) {
      // Eliminar requisitos existentes
      await prisma.requisitoOferta.deleteMany({ 
        where: { ofertaId: parseInt(id) } 
      });

      // Crear nuevos requisitos
      if (requisitos.length > 0) {
        const requisitosACrear = requisitos.map((req, index) => ({
          ofertaId: parseInt(id),
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
    }

    // Si se envían preguntas, actualizar completamente
    if (preguntas && Array.isArray(preguntas)) {
      // Eliminar preguntas existentes
      await prisma.preguntaOferta.deleteMany({ 
        where: { ofertaId: parseInt(id) } 
      });

      // Crear nuevas preguntas
      if (preguntas.length > 0) {
        const mapearTipoPregunta = (tipo) => {
          const mapeo = {
            'text': 'TEXT',
            'number': 'NUMBER', 
            'select': 'SELECT',
            'textarea': 'TEXTAREA',
            'test': 'SELECT'
          };
          return mapeo[tipo] || 'TEXT';
        };

        const preguntasACrear = preguntas.map((preg, index) => ({
          ofertaId: parseInt(id),
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
    }

    // Retornar oferta actualizada con relaciones
    const ofertaCompleta = await prisma.oferta.findUnique({
      where: { id: parseInt(id) },
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

    res.json({ 
      success: true,
      mensaje: 'Oferta actualizada exitosamente', 
      data: ofertaCompleta 
    });
  } catch (error) {
    console.error('Error al actualizar oferta:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar oferta', 
      detalle: error.message 
    });
  }
};

exports.eliminarOferta = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la oferta existe
    const oferta = await prisma.oferta.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!oferta) {
      return res.status(404).json({ 
        success: false,
        error: 'Oferta no encontrada' 
      });
    }

    // Eliminar la oferta (los requisitos y preguntas se eliminarán automáticamente por CASCADE)
    await prisma.oferta.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ 
      success: true,
      mensaje: 'Oferta eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar oferta:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al eliminar oferta', 
      detalle: error.message 
    });
  }
};

