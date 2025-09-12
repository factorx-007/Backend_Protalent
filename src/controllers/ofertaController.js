const { prisma } = require('../config/database');
const { getUbicacionNombres } = require('../utils/ubicaciones');

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
    
    const ofertas = await prisma.oferta.findMany({
      where: { empresaId: parseInt(empresaId) },
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
    const { titulo, descripcion, duracion, requiereCV, requiereCarta, requisitos, preguntas } = req.body;

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

    // Actualizar campos de la oferta
    const ofertaActualizada = await prisma.oferta.update({
      where: { id: parseInt(id) },
      data: {
        titulo,
        descripcion,
        duracion,
        requiereCV,
        requiereCarta
      }
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

