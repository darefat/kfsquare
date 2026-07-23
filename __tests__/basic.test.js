const { test, expect } = require('@jest/globals');
const request = require('supertest');

// Importing the application should build the middleware graph without opening
// a listener or requiring a live MongoDB connection.
const app = require('../server');

function routeIndex(path) {
  return app._router.stack.findIndex((layer) => layer.route && layer.route.path === path);
}

test('registers health and admin routes before the 404 fallback', () => {
  const healthIndex = routeIndex('/api/health');
  const adminPageIndex = routeIndex('/admin');
  const finalMiddlewareIndex = app._router.stack.length - 1;

  expect(healthIndex).toBeGreaterThan(-1);
  expect(adminPageIndex).toBeGreaterThan(healthIndex);
  expect(adminPageIndex).toBeLessThan(finalMiddlewareIndex);
});

test('does not mount the removed chat API', () => {
  const hasChatRouter = app._router.stack.some((layer) =>
    String(layer.regexp).includes('api\\/chat')
  );

  expect(hasChatRouter).toBe(false);
});

test('serves health status without starting infrastructure', async () => {
  const response = await request(app).get('/api/health');

  expect(response.status).toBe(200);
  expect(response.body.status).toBe('healthy');
});

test('does not expose server source or the admin HTML file', async () => {
  const [sourceResponse, adminFileResponse] = await Promise.all([
    request(app).get('/server.js'),
    request(app).get('/admin.html')
  ]);

  expect(sourceResponse.status).toBe(404);
  expect(adminFileResponse.status).toBe(404);
});
