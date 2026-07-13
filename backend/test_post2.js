const http = require('http');
const FormData = require('form-data');

const form = new FormData();
form.append('title', 'Test Event 123');
form.append('visibility', 'public');
form.append('status', 'draft');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/events',
  method: 'POST',
  headers: {
    ...form.getHeaders(),
    // We need to bypass auth by sending some role header if it requires admin?
    // Wait, the route has `authenticate, requireAdmin`
    // Let me check if authentication is mocked or I need a token.
  },
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});

req.on('error', (e) => console.error(e));
form.pipe(req);
