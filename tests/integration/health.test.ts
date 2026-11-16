import request from 'supertest';
import { createApp } from '../../src/app';

describe('Health and Error Handling', () => {
  const app = createApp();

  it('GET /api/v1/health returns 200 and standard success envelope', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(typeof res.body.data.timestamp).toBe('string');
  });

  it('GET /api/v1/unknown-route returns 404 and standard error envelope', async () => {
    const res = await request(app).get('/api/v1/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route GET /api/v1/unknown-route not found',
      },
    });
  });
});