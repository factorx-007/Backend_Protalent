const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'plataforma_practicas';

let db;

async function connectMongo() {
  if (!db) {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
  }
  return db;
}

function socketModule(server) {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.user.id}`);
    
    // Unirse a una sala por su userId
    socket.join(socket.user.id.toString());

    // Unirse a una sala de chat específica
    socket.on('join-chat', (data) => {
      const { roomId, userId, targetUserId } = data;
      console.log(`Usuario ${userId} se unió a la sala ${roomId}`);
      socket.join(roomId);
    });

    // Enviar mensaje en el nuevo formato
    socket.on('send-message', (messageData) => {
      const { content, senderId, senderName, targetId } = messageData;
      const roomId = [senderId, targetId].sort().join('-');
      
      console.log(`Mensaje de ${senderName} en sala ${roomId}: ${content}`);
      
      // Emitir a la sala específica (esto llegará a ambos usuarios si están en el chat)
      socket.to(roomId).emit('receive-message', messageData);
      
      // Verificar si el usuario objetivo está actualmente en la sala de chat
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      let targetInRoom = false;
      
      if (roomSockets) {
        for (const socketId of roomSockets) {
          const targetSocket = io.sockets.sockets.get(socketId);
          if (targetSocket && targetSocket.user.id.toString() === targetId.toString()) {
            targetInRoom = true;
            break;
          }
        }
      }
      
      // Si el usuario objetivo NO está en la sala del chat, enviar notificación
      if (!targetInRoom) {
        console.log(`Usuario ${targetId} no está en la sala ${roomId}, enviando notificación`);
        io.to(targetId.toString()).emit('chat-notification', {
          ...messageData,
          type: 'message'
        });
      }
      
      console.log(`Mensaje enviado a sala ${roomId}`);
    });

    // Indicador de escritura
    socket.on('typing', (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit('user-typing', { userId });
    });

    // Parar indicador de escritura
    socket.on('stop-typing', (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit('user-stopped-typing', { userId });
    });

    // Enviar mensaje (funcionalidad existente para retrocompatibilidad)
    socket.on('send_message', async (data) => {
      const { to, text } = data;
      const from = socket.user.id;
      const db = await connectMongo();
      // Buscar o crear chat
      let chat = await db.collection('chats').findOne({ users: { $all: [from, to] } });
      if (!chat) {
        const chatDoc = {
          users: [from, to],
          lastMessage: { text, sender: from, timestamp: new Date() },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await db.collection('chats').insertOne(chatDoc);
        chat = { ...chatDoc, _id: result.insertedId };
      } else {
        await db.collection('chats').updateOne(
          { _id: chat._id },
          { $set: { lastMessage: { text, sender: from, timestamp: new Date() }, updatedAt: new Date() } }
        );
      }
      // Guardar mensaje
      const message = {
        chatId: chat._id,
        sender: from,
        receiver: to,
        text,
        read: false,
        timestamp: new Date()
      };
      await db.collection('messages').insertOne(message);
      // Emitir al receptor si está conectado
      io.to(to.toString()).emit('receive_message', { ...message, chatId: chat._id });
      // Emitir al emisor para confirmación
      socket.emit('message_sent', { ...message, chatId: chat._id });
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.user.id}`);
    });
  });

  return io;
}

module.exports = socketModule; 