const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Obtener detalles completos de una oferta con todas sus relaciones
 */
const obtenerDetalleOferta = async (req, res) => {
  try {
    const { ofertaId } = req.params;
    const userId = req.user.id;

    // Verificar que el usuario sea una empresa
    const empresa = await prisma.empresa.findUnique({
      where: { usuarioId: userId }
    });

    if (!empresa) {
      return res.status(403).json({ 
        error: 'Solo las empresas pueden acceder a los detalles de ofertas' 
      });
    }

    // Obtener la oferta con todas sus relaciones
    const oferta = await prisma.oferta.findFirst({
      where: {
        id: parseInt(ofertaId),
        empresaId: empresa.id // Asegurar que la oferta pertenezca a la empresa
      },
      include: {
        empresa: {
          select: {
            id: true,
            nombre_empresa: true,
            rubro: true,
            logo_url: true
          }
        },
        requisitos: {
          orderBy: { orden: 'asc' }
        },
        preguntas: {
          orderBy: { orden: 'asc' }
        },
        postulaciones: {
          include: {
            estudiante: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true
                  }
                }
              }
            },
            respuestas: {
              include: {
                preguntaOferta: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!oferta) {
      return res.status(404).json({ 
        error: 'Oferta no encontrada o no tienes permisos para verla' 
      });
    }

    // Calcular estadísticas adicionales
    const estadisticas = {
      totalPostulaciones: oferta.postulaciones.length,
      postulacionesPendientes: oferta.postulaciones.filter(p => p.estado === 'PENDIENTE').length,
      postulacionesAceptadas: oferta.postulaciones.filter(p => p.estado === 'ACEPTADA').length,
      postulacionesRechazadas: oferta.postulaciones.filter(p => p.estado === 'RECHAZADA').length,
      tiempoPromedioPenalizacion: 0, // Placeholder para cálculo futuro
      ultimaPostulacion: oferta.postulaciones[0]?.createdAt || null
    };

    // Agregar estadísticas al objeto oferta
    const ofertaConEstadisticas = {
      ...oferta,
      estadisticas
    };

    res.json({
      success: true,
      data: ofertaConEstadisticas
    });

  } catch (error) {
    console.error('Error al obtener detalles de la oferta:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener detalles de la oferta' 
    });
  }
};

/**
 * Obtener analytics de una oferta específica
 */
const obtenerAnalyticsOferta = async (req, res) => {
  try {
    const { ofertaId } = req.params;
    const userId = req.user.id;

    // Verificar que el usuario sea una empresa
    const empresa = await prisma.empresa.findUnique({
      where: { usuarioId: userId }
    });

    if (!empresa) {
      return res.status(403).json({ 
        error: 'Solo las empresas pueden acceder a analytics de ofertas' 
      });
    }

    // Verificar que la oferta pertenezca a la empresa
    const oferta = await prisma.oferta.findFirst({
      where: {
        id: parseInt(ofertaId),
        empresaId: empresa.id
      },
      include: {
        postulaciones: {
          select: {
            id: true,
            estado: true,
            createdAt: true
          }
        }
      }
    });

    if (!oferta) {
      return res.status(404).json({ 
        error: 'Oferta no encontrada o no tienes permisos para verla' 
      });
    }

    // Calcular métricas de analytics
    const totalPostulaciones = oferta.postulaciones.length;
    const fechaCreacion = new Date(oferta.createdAt);
    const diasPublicada = Math.ceil((new Date() - fechaCreacion) / (1000 * 60 * 60 * 24));
    
    // Simulación de vistas (en el futuro se implementará tracking real)
    const viewsEstimadas = Math.max(totalPostulaciones * 8, 20); // Estimación conservadora
    
    const analytics = {
      views: viewsEstimadas,
      applications: totalPostulaciones,
      conversionRate: viewsEstimadas > 0 ? Math.round((totalPostulaciones / viewsEstimadas) * 100) : 0,
      averageTimeToApply: '2.5 días', // Placeholder
      topSourceChannels: [
        { channel: 'Portal ProTalent', percentage: 70 },
        { channel: 'Redes Sociales', percentage: 20 },
        { channel: 'Referencias', percentage: 10 }
      ],
      dailyStats: generateDailyStats(fechaCreacion, oferta.postulaciones),
      competitorComparison: {
        avgApplicationsInSector: Math.round(totalPostulaciones * 1.2),
        performanceVsAvg: totalPostulaciones > 5 ? 'Arriba del promedio' : 'Dentro del promedio'
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error al obtener analytics de la oferta:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener analytics' 
    });
  }
};

/**
 * Generar estadísticas diarias de postulaciones
 */
function generateDailyStats(fechaCreacion, postulaciones) {
  const stats = [];
  const hoy = new Date();
  const inicio = new Date(fechaCreacion);
  
  // Generar datos para los últimos 7 días o desde la creación
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    
    if (fecha >= inicio) {
      const postulacionesDelDia = postulaciones.filter(p => {
        const fechaPostulacion = new Date(p.createdAt);
        return fechaPostulacion.toDateString() === fecha.toDateString();
      }).length;
      
      stats.push({
        date: fecha.toISOString().split('T')[0],
        applications: postulacionesDelDia,
        views: Math.max(postulacionesDelDia * 5, 3) // Estimación de vistas
      });
    }
  }
  
  return stats;
}

/**
 * Obtener insights de IA para una oferta (preparado para implementación futura)
 */
const obtenerInsightsIA = async (req, res) => {
  try {
    const { ofertaId } = req.params;
    const userId = req.user.id;

    // Verificar que el usuario sea una empresa
    const empresa = await prisma.empresa.findUnique({
      where: { usuarioId: userId }
    });

    if (!empresa) {
      return res.status(403).json({ 
        error: 'Solo las empresas pueden acceder a insights de ofertas' 
      });
    }

    // Verificar que la oferta pertenezca a la empresa
    const oferta = await prisma.oferta.findFirst({
      where: {
        id: parseInt(ofertaId),
        empresaId: empresa.id
      },
      include: {
        postulaciones: true,
        requisitos: true
      }
    });

    if (!oferta) {
      return res.status(404).json({ 
        error: 'Oferta no encontrada o no tienes permisos para verla' 
      });
    }

    // Simular insights de IA (en el futuro se conectará a un servicio de IA real)
    const insights = {
      performanceScore: calculatePerformanceScore(oferta),
      recommendations: generateRecommendations(oferta),
      trendingKeywords: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
      competitiveAnalysis: {
        avgSalary: 3500,
        positionRanking: 'Top 25%',
        timeToFill: '14 días promedio',
        industryTrends: 'Demanda alta para este perfil'
      },
      optimization: {
        titleScore: 85,
        descriptionScore: 70,
        requirementsScore: 90,
        overallOptimization: 82
      },
      predictions: {
        expectedApplications: Math.max(oferta.postulaciones.length + 5, 10),
        timeToClose: '21 días',
        qualityCandidatesProbability: 75
      }
    };

    res.json({
      success: true,
      data: insights,
      message: 'Insights generados con IA simulada - Implementación completa próximamente'
    });

  } catch (error) {
    console.error('Error al generar insights de IA:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al generar insights' 
    });
  }
};

/**
 * Calcular score de performance de una oferta
 */
function calculatePerformanceScore(oferta) {
  let score = 0;
  
  // Puntuación basada en completitud (40 puntos)
  if (oferta.titulo) score += 10;
  if (oferta.descripcion && oferta.descripcion.length > 100) score += 15;
  if (oferta.requisitos && oferta.requisitos.length > 0) score += 15;
  
  // Puntuación basada en postulaciones (40 puntos)
  const totalPostulaciones = oferta.postulaciones.length;
  if (totalPostulaciones > 0) score += 10;
  if (totalPostulaciones > 5) score += 15;
  if (totalPostulaciones > 10) score += 15;
  
  // Puntuación basada en tiempo activo (20 puntos)
  const diasPublicada = Math.ceil((new Date() - new Date(oferta.createdAt)) / (1000 * 60 * 60 * 24));
  if (diasPublicada > 1) score += 10;
  if (diasPublicada > 7) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Generar recomendaciones para mejorar una oferta
 */
function generateRecommendations(oferta) {
  const recommendations = [];
  
  if (!oferta.descripcion || oferta.descripcion.length < 100) {
    recommendations.push('Agrega una descripción más detallada (mínimo 100 caracteres)');
  }
  
  if (!oferta.requisitos || oferta.requisitos.length === 0) {
    recommendations.push('Define requisitos específicos para el puesto');
  }
  
  if (oferta.postulaciones.length < 5) {
    recommendations.push('Considera promocionar la oferta para obtener más postulaciones');
  }
  
  if (!oferta.duracion) {
    recommendations.push('Especifica la duración del contrato o proyecto');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('¡Excelente! Tu oferta está bien optimizada');
  }
  
  return recommendations;
}

module.exports = {
  obtenerDetalleOferta,
  obtenerAnalyticsOferta,
  obtenerInsightsIA
};