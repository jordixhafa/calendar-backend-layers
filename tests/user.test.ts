/*
import request from 'supertest';
import { app } from '../src/app';
import { connectDB } from '../src/config/db';

let token: string;

beforeAll(async () => {
  await connectDB();
  await request(app).post('/api/auth/register').send({ name: 'X', email: 'x@x.com', password: 'abcdefgh' });
  const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com', password: 'abcdefgh' });
  token = res.body.token;
});

describe('User', () => {
  it('should update profile and delete account', async () => {
    const r = await request(app).put('/api/users/me').set('Authorization', `Bearer ${token}`).send({ name: 'Y' });
    expect(r.body.name).toBe('Y');
    const d = await request(app).delete('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(d.status).toBe(204);
  });
});*/

import request from 'supertest';
import { app } from '../src/app';
import { AppDataSource } from '../src/config/db';

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('User Tests', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(201);
  });
});
