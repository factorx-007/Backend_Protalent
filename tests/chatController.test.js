const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const chatController = require('../src/controllers/chatController');
const verifyToken = (req, res, next) => { req.user = { id: 1 }; next(); };

const app = express();
app.use(bodyParser.json());
app.get('/api/chat', verifyToken, chatController.obtenerChats);
app.get('/api/chat/:chatId/messages', verifyToken, chatController.obtenerMensajes);
app.post('/api/chat/:chatId/read', verifyToken, chatController.marcarComoLeido);
app.post('/api/chat/start', verifyToken, chatController.iniciarChat);
app.get('/api/chat/search', verifyToken, chatController.buscarChatsPorUsuario);
app.delete('/api/chat/:chatId', verifyToken, chatController.eliminarChat);
app.delete('/api/chat/:chatId/messages/:messageId', verifyToken, chatController.eliminarMensaje);
app.get('/api/chat/unread-count', verifyToken, chatController.contarNoLeidos);

jest.mock('mongodb', () => {
  const actual = jest.requireActual('mongodb');
  const mockDb = {
    collection: jest.fn().mockImplementation((name) => {
      if (name === 'chats') {
        return {
          find: jest.fn(() => ({ sort: () => ({ toArray: async () => [{ _id: 'chat1', users: [1, 2] }] }) })),
          findOne: jest.fn(async () => null),
          insertOne: jest.fn(async (doc) => ({ insertedId: 'chat1' })),
        };
      }
      if (name === 'messages') {
        return {
          find: jest.fn(() => ({ sort: () => ({ skip: () => ({ limit: () => ({ toArray: async () => [{ _id: 'msg1', chatId: 'chat1', sender: 1, receiver: 2, text: 'Hola', read: false }] }) }) }) })),
          updateMany: jest.fn(async () => ({})),
        };
      }
      return {};
    })
  };
  return {
    ...actual,
    MongoClient: jest.fn(() => ({ connect: jest.fn(), db: jest.fn(() => mockDb) })),
    ObjectId: jest.fn((id) => id)
  };
});

describe('Chat Controller', () => {
  it('debe obtener los chats del usuario', async () => {
    const res = await request(app).get('/api/chat');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].users).toContain(1);
  });
  it('debe obtener mensajes de un chat', async () => {
    const res = await request(app).get('/api/chat/chat1/messages');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].text).toBe('Hola');
  });
  it('debe iniciar un chat directo', async () => {
    const res = await request(app).post('/api/chat/start').send({ otherUserId: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body.users).toContain(2);
  });
  it('debe marcar mensajes como leídos', async () => {
    const res = await request(app).post('/api/chat/chat1/read');
    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBeDefined();
  });
  it('debe buscar chats por usuario', async () => {
    chatController.__setMockChatsBuscar([{ _id: 'chat1', users: [1, 2] }]);
    const res = await request(app).get('/api/chat/search?userId=2');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].users).toContain(2);
  });
  it('debe eliminar un chat si el usuario es parte', async () => {
    chatController.__setMockChat({ _id: 'chat1', users: [1, 2] });
    const res = await request(app).delete('/api/chat/chat1');
    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/eliminado/);
  });
  it('no debe eliminar un chat si el usuario NO es parte', async () => {
    chatController.__setMockChat({ _id: 'chat1', users: [2, 3] });
    const res = await request(app).delete('/api/chat/chat1');
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/No autorizado/);
  });
  it('debe eliminar un mensaje propio', async () => {
    chatController.__setMockMessage({ _id: 'msg1', chatId: 'chat1', sender: 1 });
    const res = await request(app).delete('/api/chat/chat1/messages/msg1');
    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/eliminado/);
  });
  it('no debe eliminar mensaje de otro usuario', async () => {
    chatController.__setMockMessage({ _id: 'msg1', chatId: 'chat1', sender: 2 });
    const res = await request(app).delete('/api/chat/chat1/messages/msg1');
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/No autorizado/);
  });
  it('debe obtener conteo de mensajes no leídos por chat', async () => {
    chatController.__setMockUnreadCount([{ _id: 'chat1', count: 2 }]);
    const res = await request(app).get('/api/chat/unread-count');
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('chatId', 'chat1');
    expect(res.body[0]).toHaveProperty('unread', 2);
  });
}); 