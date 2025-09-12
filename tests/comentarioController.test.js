const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const comentarioController = require('../src/controllers/comentarioController');
const verifyToken = (req, res, next) => { req.user = { id: 1, rol: 'usuario' }; next(); };

const app = express();
app.use(bodyParser.json());
app.post('/api/comentario', verifyToken, comentarioController.crearComentario);
app.put('/api/comentario/:id', verifyToken, comentarioController.actualizarComentario);
app.delete('/api/comentario/:id', verifyToken, comentarioController.eliminarComentario);

jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    Comentario: {
      create: jest.fn(async (data) => ({ ...data, id: 1 })),
      findByPk: jest.fn(async (id) => id === '1' ? { id: 1, autorId: 1, update: jest.fn(), destroy: jest.fn() } : null)
    }
  };
});

describe('Comentario Controller', () => {
  it('debe crear un comentario válido', async () => {
    const res = await request(app)
      .post('/api/comentario')
      .send({ contenido: 'Comentario', blogPostId: 1, autorId: 1, autorTipo: 'usuario' });
    expect(res.statusCode).toBe(201);
    expect(res.body.comentario.contenido).toBe('Comentario');
  });

  it('debe rechazar comentario sin campos requeridos', async () => {
    const res = await request(app)
      .post('/api/comentario')
      .send({ contenido: '', blogPostId: '', autorId: '', autorTipo: '' });
    expect(res.statusCode).toBe(400);
  });

  it('no debe permitir editar si no es autor', async () => {
    const app2 = express();
    app2.use(bodyParser.json());
    app2.put('/api/comentario/:id', (req, res, next) => { req.user = { id: 2, rol: 'usuario' }; next(); }, comentarioController.actualizarComentario);
    const res = await request(app2)
      .put('/api/comentario/1')
      .send({ contenido: 'Nuevo' });
    expect(res.statusCode).toBe(403);
  });

  it('debe permitir eliminar si es autor', async () => {
    const res = await request(app)
      .delete('/api/comentario/1');
    expect(res.statusCode).toBe(200);
  });
}); 