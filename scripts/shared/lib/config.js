const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../../.env"),
});

// Configuration
const config = {
  GATEWAY_API_URL: process.env.GATEWAY_API_URL || "http://localhost:3000",
  API_KEY: process.env.API_KEY || "demo-key-1",
  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://localhost:5672",
  BLOCKCHAIN_FORMAT: process.env.BLOCKCHAIN_FORMAT || "hedera",
  HEDERA_PRIVATE_KEY: process.env.HEDERA_PRIVATE_KEY,
  ETHEREUM_PRIVATE_KEY: process.env.ETHEREUM_PRIVATE_KEY,
  ETHEREUM_GAS_PRICE_GWEI: process.env.ETHEREUM_GAS_PRICE_GWEI || "600",
  ACCOUNT_ID: process.env.ACCOUNT_ID,
};

// Console colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

module.exports = {
  config,
  colors,
};
