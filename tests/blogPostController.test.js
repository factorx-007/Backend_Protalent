const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const blogPostController = require('../src/controllers/blogPostController');
const verifyToken = (req, res, next) => { req.user = { id: 1, rol: 'usuario' }; next(); };

const app = express();
app.use(bodyParser.json());
app.post('/api/blog', verifyToken, blogPostController.crearPost);
app.put('/api/blog/:id', verifyToken, blogPostController.actualizarPost);
app.delete('/api/blog/:id', verifyToken, blogPostController.eliminarPost);

jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    BlogPost: {
      create: jest.fn(async (data) => ({ ...data, id: 1 })),
      findByPk: jest.fn(async (id) => id === '1' ? { id: 1, autorId: 1, update: jest.fn(), destroy: jest.fn() } : null)
    }
  };
});

describe('BlogPost Controller', () => {
  it('debe crear un post válido', async () => {
    const res = await request(app)
      .post('/api/blog')
      .send({ titulo: 'Test', contenido: 'Contenido', autorId: 1, autorTipo: 'usuario' });
    expect(res.statusCode).toBe(201);
    expect(res.body.post.titulo).toBe('Test');
  });

  it('debe rechazar post sin campos requeridos', async () => {
    const res = await request(app)
      .post('/api/blog')
      .send({ titulo: '', contenido: '', autorId: '', autorTipo: '' });
    expect(res.statusCode).toBe(400);
  });

  it('no debe permitir editar si no es autor', async () => {
    const app2 = express();
    app2.use(bodyParser.json());
    app2.put('/api/blog/:id', (req, res, next) => { req.user = { id: 2, rol: 'usuario' }; next(); }, blogPostController.actualizarPost);
    const res = await request(app2)
      .put('/api/blog/1')
      .send({ titulo: 'Nuevo' });
    expect(res.statusCode).toBe(403);
  });

  it('debe permitir eliminar si es autor', async () => {
    const res = await request(app)
      .delete('/api/blog/1');
    expect(res.statusCode).toBe(200);
  });
}); 