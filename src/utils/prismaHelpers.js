// src/utils/prismaHelpers.js - Helpers para conversiones Sequelize -> Prisma

/**
 * Convierte operadores de Sequelize a filtros de Prisma
 */
const buildPrismaWhere = (sequelizeWhere) => {
  const prismaWhere = {};
  
  for (const [key, value] of Object.entries(sequelizeWhere)) {
    if (key === 'Op.or' || key === '[Op.or]') {
      prismaWhere.OR = value.map(condition => buildPrismaWhere(condition));
    } else if (key === 'Op.and' || key === '[Op.and]') {
      prismaWhere.AND = value.map(condition => buildPrismaWhere(condition));
    } else if (typeof value === 'object' && value !== null) {
      // Manejar operadores específicos
      if (value['Op.like'] || value['[Op.like]']) {
        const likeValue = value['Op.like'] || value['[Op.like]'];
        const cleanValue = likeValue.replace(/%/g, '');
        prismaWhere[key] = { contains: cleanValue, mode: 'insensitive' };
      } else if (value['Op.ne'] || value['[Op.ne]']) {
        prismaWhere[key] = { not: value['Op.ne'] || value['[Op.ne]'] };
      } else if (value['Op.in'] || value['[Op.in]']) {
        prismaWhere[key] = { in: value['Op.in'] || value['[Op.in]'] };
      } else if (value['Op.gt'] || value['[Op.gt]']) {
        prismaWhere[key] = { gt: value['Op.gt'] || value['[Op.gt]'] };
      } else if (value['Op.gte'] || value['[Op.gte]']) {
        prismaWhere[key] = { gte: value['Op.gte'] || value['[Op.gte]'] };
      } else if (value['Op.lt'] || value['[Op.lt]']) {
        prismaWhere[key] = { lt: value['Op.lt'] || value['[Op.lt]'] };
      } else if (value['Op.lte'] || value['[Op.lte]']) {
        prismaWhere[key] = { lte: value['Op.lte'] || value['[Op.lte]'] };
      } else {
        prismaWhere[key] = value;
      }
    } else {
      prismaWhere[key] = value;
    }
  }
  
  return prismaWhere;
};

/**
 * Convierte orden de Sequelize a Prisma
 */
const buildPrismaOrderBy = (sequelizeOrder) => {
  if (!sequelizeOrder || !Array.isArray(sequelizeOrder)) {
    return undefined;
  }
  
  return sequelizeOrder.map(orderItem => {
    if (Array.isArray(orderItem)) {
      const [field, direction] = orderItem;
      return { [field]: direction.toLowerCase() };
    }
    return orderItem;
  });
};

/**
 * Convierte includes de Sequelize a Prisma include
 */
const buildPrismaInclude = (sequelizeIncludes) => {
  if (!sequelizeIncludes || !Array.isArray(sequelizeIncludes)) {
    return {};
  }
  
  const include = {};
  
  sequelizeIncludes.forEach(inc => {
    const modelName = inc.model?.name?.toLowerCase() || inc.association || inc.as;
    if (modelName) {
      include[modelName] = {
        select: inc.attributes ? 
          inc.attributes.reduce((acc, attr) => ({ ...acc, [attr]: true }), {}) :
          true
      };
    }
  });
  
  return include;
};

/**
 * Convierte respuesta de paginación de Sequelize a formato estándar
 */
const buildPaginationResponse = (data, page, limit, total) => {
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const totalPages = Math.ceil(total / itemsPerPage);
  
  return {
    data,
    pagination: {
      currentPage,
      totalPages,
      totalItems: total,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  };
};

/**
 * Helper para búsquedas con texto
 */
const buildSearchFilter = (searchTerm, fields) => {
  if (!searchTerm || !fields || !Array.isArray(fields)) {
    return {};
  }
  
  return {
    OR: fields.map(field => ({
      [field]: { contains: searchTerm, mode: 'insensitive' }
    }))
  };
};

/**
 * Normaliza roles para Prisma (mayúsculas)
 */
const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return role;
  return role.toUpperCase();
};

/**
 * Convierte enum de base de datos a formato frontend
 */
const formatEnumForResponse = (enumValue) => {
  if (!enumValue) return enumValue;
  return enumValue.toLowerCase();
};

module.exports = {
  buildPrismaWhere,
  buildPrismaOrderBy,
  buildPrismaInclude,
  buildPaginationResponse,
  buildSearchFilter,
  normalizeRole,
  formatEnumForResponse
};