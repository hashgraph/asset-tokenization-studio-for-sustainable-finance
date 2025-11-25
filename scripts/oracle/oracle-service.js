const axios = require('axios');
const { logSuccess, logError, logInfo, log, colors } = require('../shared/lib/logger');

const ORACLE_API_URL = process.env.ORACLE_API_URL || 'http://localhost:3010';

class OracleClient {
  constructor(baseURL = ORACLE_API_URL) {
    this.baseURL = baseURL;
    this.timeout = 30000;
  }

  async request(method, endpoint, data = null) {
    const config = {
      method: method.toUpperCase(),
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: this.timeout,
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response;
    } catch (error) {
      if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async get(endpoint) {
    return this.request('GET', endpoint);
  }

  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  async patch(endpoint, data) {
    return this.request('PATCH', endpoint, data);
  }

  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

const oracleClient = new OracleClient();

/**
 * Check Oracle API health
 */
async function checkHealth() {
  log('\n🔍 Checking Oracle API health...', colors.bright);

  try {
    const response = await oracleClient.get('/api/v1/oracle/health');
    logSuccess(`Oracle API is healthy! Status: ${response.data.status}`);
    return response.data;
  } catch (error) {
    logError(`Failed to check health: ${error.message}`);
    throw error;
  }
}

/**
 * Create Oracle Registry
 */
async function createOracleRegistry(data) {
  log('\n📋 Creating Oracle Registry...', colors.bright);

  const registryData = {
    bondContractId: data.bondContractId || '0.0.12345',
    kpiContractId: data.kpiContractId || '0.0.67890',
    projects: data.projects || [
      { projectId: 'project-1', topicId: '0.0.11111' }
    ],
    schedulerStartDate: data.schedulerStartDate || new Date('2025-01-01T00:00:00.000Z').toISOString(),
    schedulerEndDate: data.schedulerEndDate || new Date('2030-01-01T00:00:00.000Z').toISOString(),
    frequencyMinutes: data.frequencyMinutes || 60
  };

  try {
    const response = await oracleClient.post('/api/v1/oracle/oracle/registries', registryData);
    logSuccess('Oracle Registry created successfully!');
    logInfo(`Registry ID: ${response.data.id}`);
    logInfo(`Bond Contract: ${response.data.bondContractId}`);
    logInfo(`KPI Contract: ${response.data.kpiContractId}`);
    logInfo(`Status: ${response.data.status}`);
    logInfo(`Projects: ${response.data.projects.length}`);
    return response.data;
  } catch (error) {
    logError(`Failed to create Oracle Registry: ${error.message}`);
    throw error;
  }
}

/**
 * Get Oracle Registry by ID
 */
async function getOracleRegistry(registryId) {
  log(`\n🔍 Fetching Oracle Registry ${registryId}...`, colors.bright);

  try {
    const response = await oracleClient.get(`/api/v1/oracle/oracle/registries/${registryId}`);
    logSuccess('Oracle Registry fetched successfully!');
    return response.data;
  } catch (error) {
    logError(`Failed to fetch Oracle Registry: ${error.message}`);
    throw error;
  }
}

/**
 * List all Oracle Registries
 */
async function listOracleRegistries() {
  log('\n📋 Listing all Oracle Registries...', colors.bright);

  try {
    const response = await oracleClient.get('/api/v1/oracle/oracle/registries');
    logSuccess(`Found ${response.data.total} Oracle Registries`);
    return response.data;
  } catch (error) {
    logError(`Failed to list Oracle Registries: ${error.message}`);
    throw error;
  }
}

/**
 * Add project to Oracle Registry
 */
async function addProject(registryId, projectData) {
  log(`\n➕ Adding project to Registry ${registryId}...`, colors.bright);

  const project = {
    projectId: projectData.projectId,
    topicId: projectData.topicId
  };

  try {
    const response = await oracleClient.post(
      `/api/v1/oracle/oracle/registries/${registryId}/projects`,
      project
    );
    logSuccess('Project added successfully!');
    logInfo(`Project ID: ${project.projectId}`);
    logInfo(`Topic ID: ${project.topicId}`);
    return response.data;
  } catch (error) {
    logError(`Failed to add project: ${error.message}`);
    throw error;
  }
}

/**
 * Remove project from Oracle Registry
 */
async function removeProject(registryId, projectId) {
  log(`\n➖ Removing project ${projectId} from Registry ${registryId}...`, colors.bright);

  try {
    const response = await oracleClient.delete(
      `/api/v1/oracle/oracle/registries/${registryId}/projects/${projectId}`
    );
    logSuccess('Project removed successfully!');
    return response.data;
  } catch (error) {
    logError(`Failed to remove project: ${error.message}`);
    throw error;
  }
}

/**
 * Update Oracle Registry configuration
 */
async function updateOracleRegistry(registryId, updates) {
  log(`\n✏️  Updating Oracle Registry ${registryId}...`, colors.bright);

  try {
    const response = await oracleClient.patch(
      `/api/v1/oracle/oracle/registries/${registryId}`,
      updates
    );
    logSuccess('Oracle Registry updated successfully!');
    return response.data;
  } catch (error) {
    logError(`Failed to update Oracle Registry: ${error.message}`);
    throw error;
  }
}

/**
 * Get execution history for a registry
 */
async function getExecutionHistory(registryId) {
  log(`\n📊 Fetching execution history for Registry ${registryId}...`, colors.bright);

  try {
    const response = await oracleClient.get(
      `/api/v1/oracle/oracle/registries/${registryId}/executions`
    );
    logSuccess(`Found ${response.data.total} executions`);
    return response.data;
  } catch (error) {
    logError(`Failed to fetch execution history: ${error.message}`);
    throw error;
  }
}

/**
 * Delete Oracle Registry
 */
async function deleteOracleRegistry(registryId) {
  log(`\n🗑️  Deleting Oracle Registry ${registryId}...`, colors.bright);

  try {
    await oracleClient.delete(`/api/v1/oracle/oracle/registries/${registryId}`);
    logSuccess('Oracle Registry deleted successfully!');
  } catch (error) {
    logError(`Failed to delete Oracle Registry: ${error.message}`);
    throw error;
  }
}

/**
 * Get Scheduler Config
 */
async function getSchedulerConfig() {
  log('\n⚙️  Fetching Scheduler Config...', colors.bright);

  try {
    const response = await oracleClient.get('/api/v1/oracle/scheduler/config');
    logSuccess('Scheduler Config fetched successfully!');
    logInfo(`Enabled: ${response.data.enabled}`);
    logInfo(`Cron Expression: ${response.data.cronExpression}`);
    return response.data;
  } catch (error) {
    logError(`Failed to fetch Scheduler Config: ${error.message}`);
    throw error;
  }
}

/**
 * Update Scheduler Config
 */
async function updateSchedulerConfig(updates) {
  log('\n⚙️  Updating Scheduler Config...', colors.bright);

  try {
    const response = await oracleClient.patch('/api/v1/oracle/scheduler/config', updates);
    logSuccess('Scheduler Config updated successfully!');
    return response.data;
  } catch (error) {
    logError(`Failed to update Scheduler Config: ${error.message}`);
    throw error;
  }
}

/**
 * Get Blockchain Config
 */
async function getBlockchainConfig() {
  log('\n⚙️  Fetching Blockchain Config...', colors.bright);

  try {
    const response = await oracleClient.get('/api/v1/oracle/blockchain/config');
    logSuccess('Blockchain Config fetched successfully!');
    logInfo(`Network: ${response.data.network}`);
    logInfo(`Use JSON-RPC: ${response.data.useJsonRpc}`);
    logInfo(`RPC Endpoint: ${response.data.rpcEndpoint || 'N/A'}`);
    return response.data;
  } catch (error) {
    logError(`Failed to fetch Blockchain Config: ${error.message}`);
    throw error;
  }
}

/**
 * Update Blockchain Config
 */
async function updateBlockchainConfig(updates) {
  log('\n⚙️  Updating Blockchain Config...', colors.bright);

  try {
    const response = await oracleClient.patch('/api/v1/oracle/blockchain/config', updates);
    logSuccess('Blockchain Config updated successfully!');
    return response.data;
  } catch (error) {
    logError(`Failed to update Blockchain Config: ${error.message}`);
    throw error;
  }
}

/**
 * Get Indexer Config
 */
async function getIndexerConfig() {
  log('\n⚙️  Fetching Indexer Config...', colors.bright);

  try {
    const response = await oracleClient.get('/api/v1/oracle/indexer/config');
    logSuccess('Indexer Config fetched successfully!');
    logInfo(`Endpoint: ${response.data.endpoint}`);
    return response.data;
  } catch (error) {
    logError(`Failed to fetch Indexer Config: ${error.message}`);
    throw error;
  }
}

/**
 * Update Indexer Config
 */
async function updateIndexerConfig(updates) {
  log('\n⚙️  Updating Indexer Config...', colors.bright);

  try {
    const response = await oracleClient.patch('/api/v1/oracle/indexer/config', updates);
    logSuccess('Indexer Config updated successfully!');
    return response.data;
  } catch (error) {
    logError(`Failed to update Indexer Config: ${error.message}`);
    throw error;
  }
}

module.exports = {
  OracleClient,
  oracleClient,
  checkHealth,
  createOracleRegistry,
  getOracleRegistry,
  listOracleRegistries,
  addProject,
  removeProject,
  updateOracleRegistry,
  getExecutionHistory,
  deleteOracleRegistry,
  getSchedulerConfig,
  updateSchedulerConfig,
  getBlockchainConfig,
  updateBlockchainConfig,
  getIndexerConfig,
  updateIndexerConfig
};
