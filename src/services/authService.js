//src/services/authService
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const generateToken = require('../utils/generateToken');

const login = async (email, password) => {
  const user = await Usuario.findOne({ where: { email } });

  if (!user) throw new Error('Usuario no encontrado');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Contraseña incorrecta');

  const token = generateToken({ id: user.id, rol: user.rol });
  return { user, token };
};

module.exports = { login };
