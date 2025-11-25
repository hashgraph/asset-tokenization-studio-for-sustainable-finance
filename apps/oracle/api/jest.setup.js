process.env.NODE_ENV = 'test';

// Polyfill for crypto in Jest environment (Node.js webcrypto API)
const { webcrypto } = require('crypto');
Object.defineProperty(global, 'crypto', {
  value: webcrypto,
  writable: true,
  configurable: true
});
