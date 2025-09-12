// src/config/google.js
const { OAuth2Client } = require('google-auth-library');

// Configuración de Google OAuth
const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI
};

// Validar configuración
const validateGoogleConfig = () => {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Faltan variables de entorno para Google OAuth:', missing);
    return false;
  }
  
  console.log('✅ Configuración de Google OAuth válida');
  return true;
};

// Cliente de Google OAuth
const createGoogleClient = () => {
  if (!validateGoogleConfig()) {
    throw new Error('Configuración de Google OAuth inválida');
  }
  
  return new OAuth2Client(googleConfig.clientId);
};

module.exports = {
  googleConfig,
  validateGoogleConfig,
  createGoogleClient
};
