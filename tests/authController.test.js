const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authController = require('../src/controllers/authController');

const app = express();
app.use(bodyParser.json());
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);

jest.mock('../src/models', () => {
  const actual = jest.requireActual('../src/models');
  return {
    ...actual,
    Usuario: {
      findOne: jest.fn(async ({ where }) => where.email === 'test@mail.com' ? { id: 1, email: 'test@mail.com', password: '$2a$10$hash', rol: 'usuario', nombre: 'Test', comparePassword: async () => true } : null),
      create: jest.fn(async (data) => ({ ...data, id: 2 }))
    }
  };
});

describe('Auth Controller', () => {
  it('debe rechazar login con usuario no existente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@mail.com', password: '1234' });
    expect(res.statusCode).toBe(404);
  });
  it('debe permitir registro válido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Nuevo', email: 'nuevo@mail.com', password: '1234', rol: 'usuario' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe('nuevo@mail.com');
  });
}); 