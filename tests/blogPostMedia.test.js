const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const blogPostController = require('../src/controllers/blogPostController');
const verifyToken = (req, res, next) => { req.user = { id: 1, rol: 'usuario' }; next(); };

const app = express();
app.use(bodyParser.json());
app.post('/api/blog/:id/media', verifyToken, (req, res, next) => { req.file = { path: 'url', mimetype: 'image/png', size: 1234 }; next(); }, blogPostController.agregarMedia);
app.get('/api/blog/:id/media', blogPostController.obtenerMedia);

jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    BlogPostMedia: {
      create: jest.fn(async (data) => ({ ...data, id: 1 })),
      findAll: jest.fn(async (query) => [{ id: 1, blogPostId: 1, ruta: 'url', tipo: 'image/png', tamano: 1234 }])
    }
  };
});

describe('BlogPostMedia Controller', () => {
  it('debe agregar media a un post', async () => {
    const res = await request(app)
      .post('/api/blog/1/media')
      .send({ blogPostId: 1 });
    expect(res.statusCode).toBe(201);
    expect(res.body.media.ruta).toBe('url');
  });

  it('debe obtener media de un post', async () => {
    const res = await request(app)
      .get('/api/blog/1/media');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].ruta).toBe('url');
  });
}); 