const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const blogPostController = require('../src/controllers/blogPostController');
const verifyToken = (req, res, next) => { req.user = { id: 1, rol: 'usuario' }; next(); };

const app = express();
app.use(bodyParser.json());
app.post('/api/blog/:id/reaccion', verifyToken, blogPostController.reaccionar);
app.get('/api/blog/:id/reacciones', blogPostController.obtenerReacciones);

jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    BlogPostReaction: {
      findOne: jest.fn(async () => null),
      create: jest.fn(async (data) => ({ ...data, id: 1 })),
      findAll: jest.fn(async (query) => [{ id: 1, blogPostId: 1, userId: 1, tipo: 'like' }])
    }
  };
});

describe('BlogPostReaction Controller', () => {
  it('debe añadir una reacción a un post', async () => {
    const res = await request(app)
      .post('/api/blog/1/reaccion')
      .send({ blogPostId: 1, tipo: 'like' });
    expect(res.statusCode).toBe(200);
    expect(res.body.reaccion.tipo).toBe('like');
  });

  it('debe obtener reacciones de un post', async () => {
    const res = await request(app)
      .get('/api/blog/1/reacciones');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].tipo).toBe('like');
  });
}); 