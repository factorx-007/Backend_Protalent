const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const blogPostController = require('../src/controllers/blogPostController');

const app = express();
app.use(bodyParser.json());
app.get('/api/blog', blogPostController.obtenerPosts);

jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    BlogPost: {
      findAll: jest.fn(async (opts) => [
        { id: 1, titulo: 'Más Interacciones', compartidos: 10, createdAt: new Date() },
        { id: 2, titulo: 'Menos Interacciones', compartidos: 1, createdAt: new Date() }
      ])
    },
    Categoria: { },
    BlogPostMedia: { },
    BlogPostReaction: { },
    Comentario: { }
  };
});

describe('BlogPost Ordenamiento Controller', () => {
  it('debe obtener posts ordenados por interacciones', async () => {
    const res = await request(app)
      .get('/api/blog?order=interacciones');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].titulo).toBe('Más Interacciones');
  });
  it('debe obtener posts ordenados por compartidos', async () => {
    const res = await request(app)
      .get('/api/blog?order=compartidos');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].compartidos).toBeGreaterThan(res.body[1].compartidos);
  });
}); 