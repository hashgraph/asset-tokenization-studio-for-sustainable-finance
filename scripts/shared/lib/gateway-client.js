const axios = require('axios');
const { config } = require('./config');

class GatewayClient {
  constructor() {
    this.baseURL = config.GATEWAY_API_URL;
    this.apiKey = config.API_KEY;
    this.timeout = 30000;
  }
  async request(method, endpoint, data = null, options = {}) {
    const config = {
      method: method.toUpperCase(),
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...options.headers
      },
      timeout: this.timeout,
      ...options
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Check your API key configuration.');
      }
      throw error;
    }
  }
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, null, options);
  }

  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }
}
const gatewayClient = new GatewayClient();

module.exports = {
  GatewayClient,
  gatewayClient
};