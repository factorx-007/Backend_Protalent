// server.js
const app = require('./app');
const dotenv = require('dotenv');
const { connectDatabase } = require('./config/database');
const { validateGoogleConfig } = require('./config/google');
const { validateCloudinaryConfig } = require('./config/cloudinary');
const http = require('http');
const socketModule = require('./chat/socket');

dotenv.config();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    console.log('📦 Base de datos conectada y lista para usar');

    // Validar configuración de Google OAuth
    validateGoogleConfig();
    
    // Validar configuración de Cloudinary
    validateCloudinaryConfig();

    // Crear servidor HTTP y pasar a Express
    const server = http.createServer(app);
    // Iniciar Socket.IO
    socketModule(server);

    server.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
      console.log(`🔐 Google OAuth configurado: ${process.env.GOOGLE_CLIENT_ID ? 'SÍ' : 'NO'}`);
      console.log(`☁️ Cloudinary configurado: ${process.env.CLOUDINARY_CLOUD_NAME ? 'SÍ' : 'NO'}`);
      console.log(`💬 Socket.IO para chat en tiempo real activo`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
  }
};

startServer();
