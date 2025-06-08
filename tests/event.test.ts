// Event test
import request from 'supertest';
import { app } from '../src/app';
import { connectDB } from '../src/config/db';

let token: string;
beforeAll(async () => {
  await connectDB();
  await request(app).post('/api/auth/register').send({ name: 'A', email: 'a@a.com', password: 'abcdefgh' });
  const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com', password: 'abcdefgh' });
  token = res.body.token;
});

describe('Events CRUD', () => {
  let evId: string;
  it('create → list → get → update → delete', async () => {
    const data = { title:'T', description:'D', start:new Date(), end:new Date(), label:'L' };
    const c = await request(app).post('/api/events').set('Authorization', `Bearer ${token}`).send(data);
    expect(c.status).toBe(201); evId = c.body.id;
    const l = await request(app).get('/api/events').set('Authorization', `Bearer ${token}`);
    expect(l.body.length).toBe(1);
    const g = await request(app).get(`/api/events/${evId}`).set('Authorization', `Bearer ${token}`);
    expect(g.body.id).toBe(evId);
    const u = await request(app).put(`/api/events/${evId}`).set('Authorization', `Bearer ${token}`).send({ ...data, title:'X'});
    expect(u.body.title).toBe('X');
    const d = await request(app).delete(`/api/events/${evId}`).set('Authorization', `Bearer ${token}`);
    expect(d.status).toBe(204);
  });
});
