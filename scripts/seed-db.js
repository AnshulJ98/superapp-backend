#!/usr/bin/env node

/**
 * Seed script for SuperApp backend
 * Creates demo users via the API Gateway
 * Usage: node scripts/seed-db.js
 */

const http = require('http');

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, GATEWAY_URL);
    const bodyStr = body ? JSON.stringify(body) : '';
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(bodyStr);
    req.end();
  });
}

async function seed() {
  console.log(`Seeding database via gateway at ${GATEWAY_URL}...\n`);

  const demoUsers = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Charlie', email: 'charlie@example.com' },
  ];

  for (const user of demoUsers) {
    try {
      const result = await makeRequest('POST', '/users', user);
      if (result.status === 201 || result.status === 200) {
        console.log(`✓ Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`✗ Failed to create ${user.name}: ${result.status}`);
      }
    } catch (err) {
      console.error(`Error creating ${user.name}:`, err.message);
    }
  }

  console.log('\nSeeding complete! Run `npm run demo` in clients/api to see users.\n');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
