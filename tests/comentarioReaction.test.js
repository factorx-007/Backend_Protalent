const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const comentarioController = require('../src/controllers/comentarioController');
const verifyToken = (req, res, next) => { req.user = { id: 1, rol: 'usuario' }; next(); };

const app = express();
app.use(bodyParser.json());
app.post('/api/comentario/:id/reaccion', verifyToken, comentarioController.reaccionar);
app.get('/api/comentario/:id/reacciones', comentarioController.obtenerReacciones);

jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    ComentarioReaction: {
      findOne: jest.fn(async () => null),
      create: jest.fn(async (data) => ({ ...data, id: 1 })),
      findAll: jest.fn(async (query) => [{ id: 1, comentarioId: 1, userId: 1, tipo: 'like' }])
    }
  };
});

describe('ComentarioReaction Controller', () => {
  it('debe añadir una reacción a un comentario', async () => {
    const res = await request(app)
      .post('/api/comentario/1/reaccion')
      .send({ comentarioId: 1, tipo: 'like' });
    expect(res.statusCode).toBe(200);
    expect(res.body.reaccion.tipo).toBe('like');
  });

  it('debe obtener reacciones de un comentario', async () => {
    const res = await request(app)
      .get('/api/comentario/1/reacciones');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].tipo).toBe('like');
  });
}); 