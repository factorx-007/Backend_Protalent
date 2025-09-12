const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const comentarioController = require('../src/controllers/comentarioController');
const verifyToken = (req, res, next) => { req.user = { id: 1, rol: 'usuario' }; next(); };

const app = express();
app.use(bodyParser.json());
app.post('/api/comentario/:id/media', verifyToken, (req, res, next) => { req.file = { path: 'url', mimetype: 'image/png', size: 1234 }; next(); }, comentarioController.agregarMedia);
app.get('/api/comentario/:id/media', comentarioController.obtenerMedia);

jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    ComentarioMedia: {
      create: jest.fn(async (data) => ({ ...data, id: 1 })),
      findAll: jest.fn(async (query) => [{ id: 1, comentarioId: 1, ruta: 'url', tipo: 'image/png', tamano: 1234 }])
    }
  };
});

describe('ComentarioMedia Controller', () => {
  it('debe agregar media a un comentario', async () => {
    const res = await request(app)
      .post('/api/comentario/1/media')
      .send({ comentarioId: 1 });
    expect(res.statusCode).toBe(201);
    expect(res.body.media.ruta).toBe('url');
  });

  it('debe obtener media de un comentario', async () => {
    const res = await request(app)
      .get('/api/comentario/1/media');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].ruta).toBe('url');
  });
}); 