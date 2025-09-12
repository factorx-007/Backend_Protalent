const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const comentarioController = require('../src/controllers/comentarioController');

const app = express();
app.use(bodyParser.json());
app.get('/api/comentario/post/:blogPostId/anidados', comentarioController.obtenerComentariosAnidados);

jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    Comentario: {
      findAll: jest.fn(async () => [
        { id: 1, blogPostId: 1, contenido: 'Padre', parentId: null, dataValues: { id: 1, blogPostId: 1, contenido: 'Padre', parentId: null } },
        { id: 2, blogPostId: 1, contenido: 'Hijo', parentId: 1, dataValues: { id: 2, blogPostId: 1, contenido: 'Hijo', parentId: 1 } }
      ])
    }
  };
});

describe('Comentario Anidados Controller', () => {
  it('debe obtener comentarios anidados en estructura de árbol', async () => {
    const res = await request(app)
      .get('/api/comentario/post/1/anidados');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].respuestas.length).toBe(1);
    expect(res.body[0].respuestas[0].contenido).toBe('Hijo');
  });
}); 