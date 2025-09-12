// server.js
const app = require('./app');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const { validateGoogleConfig } = require('./config/google');
const { validateCloudinaryConfig } = require('./config/cloudinary');
const http = require('http');
const socketModule = require('./chat/socket');

dotenv.config();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida con éxito');

    await sequelize.sync();
    console.log('📦 Modelos sincronizados con la base de datos');

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
