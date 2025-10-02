require('dotenv').config();

// Configuration
const config = {
  ATS_API_URL: process.env.ATS_API_URL || 'http://localhost:3000',
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  BLOCKCHAIN_FORMAT: process.env.BLOCKCHAIN_FORMAT || 'hedera',
  HEDERA_PRIVATE_KEY: process.env.HEDERA_PRIVATE_KEY,
  ETHEREUM_PRIVATE_KEY: process.env.ETHEREUM_PRIVATE_KEY
};

// Console colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

module.exports = {
  config,
  colors
};