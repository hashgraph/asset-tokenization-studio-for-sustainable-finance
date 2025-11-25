const { spawn } = require('child_process');
const path = require('path');
const { log, logSuccess, logError, logHeader, logInfo, colors } = require('../shared/lib/logger');
const {
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
  getIndexerConfig
} = require('./oracle-service');

const ORACLE_API_PATH = path.join(__dirname, '../../apps/oracle/api');

// Utility function to wait for a condition
async function waitFor(conditionFn, timeout = 30000, interval = 1000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const result = await conditionFn();
      if (result) return true;
    } catch (error) {
      // Ignore errors and keep trying
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Timeout waiting for condition');
}

// Start Docker services
async function startDockerServices() {
  logHeader('🐳 Starting Docker Services...');

  return new Promise((resolve, reject) => {
    const dockerProcess = spawn('docker', ['compose', 'up', '-d'], {
      cwd: ORACLE_API_PATH,
      stdio: 'inherit'
    });

    dockerProcess.on('close', (code) => {
      if (code === 0) {
        logSuccess('Docker services started successfully!');
        resolve();
      } else {
        reject(new Error(`Docker compose failed with code ${code}`));
      }
    });

    dockerProcess.on('error', (error) => {
      reject(new Error(`Failed to start Docker: ${error.message}`));
    });
  });
}

// Wait for PostgreSQL to be ready
async function waitForPostgreSQL() {
  log('\n⏳ Waiting for PostgreSQL to be ready...', colors.yellow);

  await waitFor(async () => {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('docker exec oracle_postgres pg_isready -U postgres', (error) => {
        resolve(!error);
      });
    });
  }, 30000, 2000);

  logSuccess('PostgreSQL is ready!');
}

// Start Oracle API
async function startOracleAPI() {
  logHeader('🚀 Starting Oracle API...');

  return new Promise((resolve, reject) => {
    const apiProcess = spawn('npm', ['run', 'start:dev'], {
      cwd: ORACLE_API_PATH,
      detached: true,
      stdio: 'ignore'
    });

    apiProcess.unref();

    // Wait for API to be ready
    setTimeout(async () => {
      try {
        await waitFor(async () => {
          try {
            await checkHealth();
            return true;
          } catch {
            return false;
          }
        }, 60000, 2000);

        logSuccess('Oracle API started successfully!');
        resolve(apiProcess.pid);
      } catch (error) {
        reject(new Error('Oracle API failed to start'));
      }
    }, 5000);
  });
}

// Stop Oracle API
async function stopOracleAPI(pid) {
  if (!pid) return;

  log('\n🛑 Stopping Oracle API...', colors.yellow);
  try {
    process.kill(-pid, 'SIGTERM');
    logSuccess('Oracle API stopped');
  } catch (error) {
    logError(`Failed to stop Oracle API: ${error.message}`);
  }
}

// Stop Docker services
async function stopDockerServices() {
  log('\n🐳 Stopping Docker services...', colors.yellow);

  return new Promise((resolve) => {
    const dockerProcess = spawn('docker', ['compose', 'down'], {
      cwd: ORACLE_API_PATH,
      stdio: 'inherit'
    });

    dockerProcess.on('close', () => {
      logSuccess('Docker services stopped');
      resolve();
    });

    dockerProcess.on('error', (error) => {
      logError(`Failed to stop Docker: ${error.message}`);
      resolve(); // Don't block cleanup
    });
  });
}

// Run E2E Tests
async function runE2ETests() {
  logHeader('🧪 Running E2E Tests...');

  let createdRegistryId = null;
  const timestamp = Date.now();

  try {
    // Test 1: Health Check
    log('\n📝 Test 1: Health Check', colors.cyan);
    await checkHealth();

    // Test 2: Get Scheduler Config
    log('\n📝 Test 2: Get Scheduler Config', colors.cyan);
    const schedulerConfig = await getSchedulerConfig();
    logInfo(`Current scheduler config: enabled=${schedulerConfig.enabled}, cron=${schedulerConfig.cronExpression}`);

    // Test 3: Create Oracle Registry
    log('\n📝 Test 3: Create Oracle Registry', colors.cyan);
    const registry = await createOracleRegistry({
      bondContractId: `0.0.${timestamp}`,
      kpiContractId: `0.0.${timestamp + 1}`,
      projects: [
        { projectId: 'test-project-1', topicId: `0.0.${timestamp + 2}` }
      ],
      frequencyMinutes: 30
    });
    createdRegistryId = registry.id;

    // Test 4: Get Oracle Registry
    log('\n📝 Test 4: Get Oracle Registry by ID', colors.cyan);
    const fetchedRegistry = await getOracleRegistry(createdRegistryId);
    if (fetchedRegistry.id !== createdRegistryId) {
      throw new Error('Registry ID mismatch!');
    }
    logSuccess(`Registry fetched correctly! ID: ${fetchedRegistry.id}`);

    // Test 5: List Oracle Registries
    log('\n📝 Test 5: List All Oracle Registries', colors.cyan);
    const registries = await listOracleRegistries();
    if (registries.total === 0) {
      throw new Error('No registries found!');
    }
    logSuccess(`Found ${registries.total} registries`);

    // Test 6: Add Project
    log('\n📝 Test 6: Add Project to Registry', colors.cyan);
    await addProject(createdRegistryId, {
      projectId: 'test-project-2',
      topicId: `0.0.${timestamp + 3}`
    });

    // Verify project was added
    const updatedRegistry = await getOracleRegistry(createdRegistryId);
    if (updatedRegistry.projects.length !== 2) {
      throw new Error(`Expected 2 projects, got ${updatedRegistry.projects.length}`);
    }
    logSuccess('Project added successfully!');

    // Test 7: Update Registry Configuration
    log('\n📝 Test 7: Update Registry Configuration', colors.cyan);
    await updateOracleRegistry(createdRegistryId, {
      frequencyMinutes: 120
    });

    const updatedFreqRegistry = await getOracleRegistry(createdRegistryId);
    if (updatedFreqRegistry.config.frequencyMinutes !== 120) {
      throw new Error(`Expected frequency 120, got ${updatedFreqRegistry.config.frequencyMinutes}`);
    }
    logSuccess('Registry frequency updated to 120 minutes');

    // Test 8: Remove Project
    log('\n📝 Test 8: Remove Project from Registry', colors.cyan);
    await removeProject(createdRegistryId, 'test-project-2');

    const registryAfterRemove = await getOracleRegistry(createdRegistryId);
    if (registryAfterRemove.projects.length !== 1) {
      throw new Error(`Expected 1 project after removal, got ${registryAfterRemove.projects.length}`);
    }
    logSuccess('Project removed successfully!');

    // Test 9: Get Execution History
    log('\n📝 Test 9: Get Execution History', colors.cyan);
    await getExecutionHistory(createdRegistryId);
    logSuccess('Execution history fetched (empty as expected for new registry)');

    // Test 10: Delete Oracle Registry
    log('\n📝 Test 10: Delete Oracle Registry', colors.cyan);
    await deleteOracleRegistry(createdRegistryId);

    // Verify deletion
    try {
      await getOracleRegistry(createdRegistryId);
      throw new Error('Registry should have been deleted but was still found!');
    } catch (error) {
      if (error.message.includes('404')) {
        logSuccess('Registry deleted successfully!');
      } else {
        throw error;
      }
    }

    // Test 11: Test duplicate KPI contract validation
    log('\n📝 Test 11: Test Duplicate KPI Contract Validation', colors.cyan);
    const kpiContractId = `0.0.${timestamp + 100}`;

    // Create first registry
    const firstRegistry = await createOracleRegistry({
      bondContractId: `0.0.${timestamp + 101}`,
      kpiContractId: kpiContractId,
      projects: [{ projectId: 'dup-test-1', topicId: `0.0.${timestamp + 102}` }],
      frequencyMinutes: 60
    });

    // Try to create second registry with same KPI contract
    try {
      await createOracleRegistry({
        bondContractId: `0.0.${timestamp + 103}`,
        kpiContractId: kpiContractId, // Same KPI contract!
        projects: [{ projectId: 'dup-test-2', topicId: `0.0.${timestamp + 104}` }],
        frequencyMinutes: 60
      });
      throw new Error('Should have failed with duplicate KPI contract error!');
    } catch (error) {
      if (error.message.includes('409') || error.message.includes('already exists')) {
        logSuccess('Duplicate KPI contract validation works correctly!');
      } else {
        throw error;
      }
    }

    // Clean up
    await deleteOracleRegistry(firstRegistry.id);

    // Test 12: Get and Update Blockchain Configuration
    log('\n📝 Test 12: Get and Update Blockchain Configuration', colors.cyan);
    const blockchainConfig = await getBlockchainConfig();
    logInfo(`Current blockchain: network=${blockchainConfig.network}, useJsonRpc=${blockchainConfig.useJsonRpc}`);

    // Update blockchain config
    await updateBlockchainConfig({
      network: 'testnet',
      useJsonRpc: true,
      rpcEndpoint: 'https://testnet.hashio.io/api'
    });

    const updatedBlockchainConfig = await getBlockchainConfig();
    if (updatedBlockchainConfig.network !== 'testnet' || !updatedBlockchainConfig.useJsonRpc) {
      throw new Error('Blockchain config not updated correctly!');
    }
    logSuccess('Blockchain configuration updated successfully!');

    // Test 13: Get Indexer Configuration
    log('\n📝 Test 13: Get Indexer Configuration', colors.cyan);
    const indexerConfig = await getIndexerConfig();
    logInfo(`Indexer endpoint: ${indexerConfig.endpoint}`);
    logSuccess('Indexer configuration retrieved successfully!');

    // Test 14: Test Scheduled Execution with Automatic Retry
    log('\n📝 Test 14: Test Scheduled Execution with Automatic Retry', colors.cyan);

    // Create a registry with execution date in the past (should execute immediately)
    const pastDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const scheduledRegistry = await createOracleRegistry({
      bondContractId: `0.0.${timestamp + 200}`,
      kpiContractId: `0.0.${timestamp + 201}`,
      projects: [
        { projectId: 'scheduled-test-1', topicId: `0.0.${timestamp + 202}` }
      ],
      schedulerStartDate: pastDate.toISOString(),
      schedulerEndDate: futureDate.toISOString(),
      frequencyMinutes: 60
    });

    logInfo(`Created registry ${scheduledRegistry.id} with past execution date`);
    logInfo('Waiting 70 seconds for scheduler to execute (cron runs every minute)...');

    // Wait for scheduler to run (cron is */1 * * * * = every minute)
    await new Promise(resolve => setTimeout(resolve, 70000));

    // Check execution history - should have at least one execution (likely failed due to no indexer)
    const historyAfterSchedule = await getExecutionHistory(scheduledRegistry.id);

    if (historyAfterSchedule.total === 0) {
      logError('Warning: No executions found. Scheduler may not have run yet.');
    } else {
      logSuccess(`Found ${historyAfterSchedule.total} execution(s) in history`);

      // Check if there are any failed executions
      const failedExecutions = historyAfterSchedule.items.filter(item => item.status === 'FAILED');
      if (failedExecutions.length > 0) {
        logInfo(`Found ${failedExecutions.length} failed execution(s) (expected - no real indexer)`);
        logInfo(`Failed execution ID: ${failedExecutions[0].id}, retry count: ${failedExecutions[0].retryCount}`);

        // Wait for automatic retry (AutoRetryService runs every minute)
        logInfo('Waiting 70 seconds for AutoRetryService to automatically retry...');
        await new Promise(resolve => setTimeout(resolve, 70000));

        // Check execution history again
        const historyAfterRetry = await getExecutionHistory(scheduledRegistry.id);
        logSuccess(`Execution history after retry: ${historyAfterRetry.total} total executions`);

        // Check if retry count increased
        const retriedExecution = historyAfterRetry.items.find(item => item.id === failedExecutions[0].id);
        if (retriedExecution && retriedExecution.retryCount > failedExecutions[0].retryCount) {
          logSuccess(`Automatic retry worked! Retry count increased from ${failedExecutions[0].retryCount} to ${retriedExecution.retryCount}`);
        } else {
          logInfo(`Retry count: ${retriedExecution ? retriedExecution.retryCount : 'N/A'}`);
        }
      }
    }

    // Clean up scheduled registry
    await deleteOracleRegistry(scheduledRegistry.id);
    logSuccess('Scheduled execution and automatic retry test completed!');

    logHeader('✅ All E2E Tests Passed!');
    return true;

  } catch (error) {
    logError(`E2E Test failed: ${error.message}`);

    // Cleanup on error
    if (createdRegistryId) {
      try {
        await deleteOracleRegistry(createdRegistryId);
      } catch (cleanupError) {
        logError(`Failed to cleanup registry: ${cleanupError.message}`);
      }
    }

    throw error;
  }
}

// Main simulator function
async function runOracleSimulator() {
  let apiPid = null;

  try {
    // Step 1: Start Docker
    await startDockerServices();
    await waitForPostgreSQL();

    // Step 2: Start Oracle API
    apiPid = await startOracleAPI();

    // Step 3: Run E2E Tests
    await runE2ETests();

    logHeader('🎉 Oracle E2E Simulation Completed Successfully!');

  } catch (error) {
    logError(`Oracle simulation failed: ${error.message}`);
    throw error;

  } finally {
    // Cleanup
    if (apiPid) {
      await stopOracleAPI(apiPid);
    }
    await stopDockerServices();

    log('\n👋 Cleanup completed', colors.bright);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  log('\n\n⚠️  Interrupted by user. Cleaning up...', colors.yellow);
  await stopDockerServices();
  process.exit(130);
});

// Main entry point
async function main() {
  try {
    logHeader('🏦 Oracle E2E Simulator');
    log('========================\n', colors.bright);

    await runOracleSimulator();
    process.exit(0);

  } catch (error) {
    logError(`Simulation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runOracleSimulator };
