#!/usr/bin/env node

/**
 * Enhanced Infrastructure Setup Script for Green Bonds Platform
 * 
 * This script manages the infrastructure components required for the demo:
 * 1. PostgreSQL Database (via Docker)
 * 2. PgAdmin (via Docker) 
 * 3. RabbitMQ (via Docker)
 * 4. ATS API (Node.js process) - Port 3001
 * 5. Primary Market API (Node.js process) - Port 3002
 * 6. API Gateway (Node.js process) - Port 3000 (with authentication)
 * 7. Transaction Sender (Node.js process) - Port 3005
 * 
 * The API Gateway provides:
 * - Authentication via API keys (x-api-key header)
 * - Proxy routing to ATS API endpoints
 * - Centralized security layer
 * 
 * Usage:
 *   node infra-setup.js start           # Start all infrastructure
 *   node infra-setup.js stop            # Stop all infrastructure 
 *   node infra-setup.js status          # Check status of all components
 *   node infra-setup.js start docker    # Start only Docker services
 *   node infra-setup.js start apis      # Start only Node.js APIs
 */

const { spawn, exec } = require('child_process');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  docker: {
    composeFile: path.join(path.dirname(__dirname), '..', 'docker-compose.yaml'),
    services: {
      postgres: {
        name: 'PostgreSQL',
        container: 'green_bonds_postgres',
        healthUrl: null, // Will check via docker health
        port: 5432
      },
      pgadmin: {
        name: 'PgAdmin',
        container: 'green_bonds_pgadmin',
        healthUrl: 'http://localhost:5050',
        port: 5050
      },
      rabbitmq: {
        name: 'RabbitMQ',
        container: 'green_bonds_rabbitmq',
        healthUrl: 'http://localhost:15672/api/overview',
        port: 15672
      }
    }
  },
  atsApi: {
    name: 'ATS API',
    path: '../../../apps/ats/api',
    port: 3001,
    healthUrl: 'http://localhost:3001/health',
    command: 'npm run start:dev',
    env: {
      PORT: '3001',
      POSTGRESQL_HOST: 'localhost',
      POSTGRESQL_PORT: '5432'
    }
  },
  primaryMarketApi: {
    name: 'Primary Market API',
    path: '../../../apps/primary-market/api',
    port: 3002,
    healthUrl: 'http://localhost:3002/health',
    command: 'npm run start:dev',
    env: {
      PORT: '3002',
      POSTGRESQL_HOST: 'localhost',
      POSTGRESQL_PORT: '5432'
    }
  },
  gateway: {
    name: 'API Gateway',
    path: '../../../apps/shared/gateway',
    port: 3000,
    healthUrl: 'http://localhost:3000/health',
    command: 'npm run start:dev',
    env: {
      PORT: '3000',
      LOG_LEVEL: 'log',
      PATHS: '/api/v1/ats,/api/v1/primary-markets',
      ROUTES: 'http://localhost:3001',
      API_KEY_HEADER_NAME: 'x-api-key',
      API_KEYS: 'demo-key-1,demo-key-2,your-secret-api-key',
      TIMEOUT: '30000'
    }
  },
  transactionSender: {
    name: 'Transaction Sender',
    path: '../../../apps/shared/transaction-sender',
    port: 3005,
    healthUrl: 'http://localhost:3005',
    command: 'npm run start:dev',
    env: {
      PORT: '3005',
      RABBITMQ_URI: 'amqp://localhost:5672'
    }
  }
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function execAsync(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function checkDockerInstalled() {
  try {
    await execAsync('docker --version');
    await execAsync('docker compose version');
    return true;
  } catch (error) {
    log('❌ Docker or Docker Compose is not installed or not running', colors.red);
    log('   Please install Docker: https://docs.docker.com/get-docker/', colors.yellow);
    return false;
  }
}

async function checkDockerServiceHealth(serviceName) {
  try {
    const { stdout } = await execAsync(`docker inspect --format='{{.State.Health.Status}}' ${CONFIG.docker.services[serviceName].container}`);
    return stdout.trim() === 'healthy';
  } catch (error) {
    return false;
  }
}

async function isDockerServiceRunning(serviceName) {
  try {
    const { stdout } = await execAsync(`docker ps -q -f name=${CONFIG.docker.services[serviceName].container}`);
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

async function startDockerServices() {
  log('🐳 Starting Docker infrastructure services...', colors.cyan);
  
  try {
    const composeFile = CONFIG.docker.composeFile;
    if (!fs.existsSync(composeFile)) {
      log(`❌ Docker compose file not found: ${composeFile}`, colors.red);
      return false;
    }

    // Start services
    await execAsync(`docker compose -f ${composeFile} up -d`, { cwd: __dirname });
    log('⏳ Waiting for services to be ready...', colors.yellow);
    
    // Wait for health checks
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      const postgresHealthy = await checkDockerServiceHealth('postgres');
      const rabbitmqHealthy = await checkDockerServiceHealth('rabbitmq');
      
      if (postgresHealthy && rabbitmqHealthy) {
        log('✅ All Docker services are healthy', colors.green);
        log('🌐 Service URLs:', colors.blue);
        log('• PostgreSQL: localhost:5432 (postgres/postgres)', colors.blue);
        log('• PgAdmin: http://localhost:5050 (admin@admin.com/admin)', colors.blue);
        log('• RabbitMQ Management: http://localhost:15672 (guest/guest)', colors.blue);
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
    
    log('⚠️  Some services may not be fully ready yet', colors.yellow);
    return true;
    
  } catch (error) {
    log(`❌ Failed to start Docker services: ${error.error?.message || error.message}`, colors.red);
    return false;
  }
}

async function stopDockerServices() {
  log('🐳 Stopping Docker services...', colors.cyan);
  
  try {
    const composeFile = CONFIG.docker.composeFile;
    await execAsync(`docker compose -f ${composeFile} down`, { cwd: __dirname });
    log('✅ Docker services stopped', colors.green);
    return true;
  } catch (error) {
    log('⚠️  Error stopping Docker services', colors.yellow);
    return true;
  }
}

async function checkServiceHealth(service) {
  if (!service.healthUrl) return false;
  
  try {
    await axios.get(service.healthUrl, {
      timeout: 2000,
      validateStatus: () => true
    });
    return true;
  } catch (error) {
    return false;
  }
}

function startNodeService(service) {
  return new Promise((resolve, reject) => {
    log(`🚀 Starting ${service.name}...`, colors.blue);
    
    const servicePath = path.resolve(__dirname, service.path);
    
    if (!fs.existsSync(servicePath)) {
      log(`❌ Service path not found: ${servicePath}`, colors.red);
      reject(new Error(`Service path not found: ${servicePath}`));
      return;
    }

    const env = { ...process.env, ...service.env };
    
    // For workspace projects, use npm from the workspace root with package name
    const workspaceRoot = path.resolve(__dirname, '../../../');
    let child;
    
    // Map service paths to workspace package names
    if (service.path.includes('apps/ats/api')) {
      const workspaceName = '@hashgraph/green-bonds-ats-api';
      child = spawn('npm', ['run', 'start:dev', '--workspace', workspaceName], {
        cwd: workspaceRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
        env: env
      });
    } else if (service.path.includes('apps/primary-market/api')) {
      const workspaceName = '@hashgraph/green-bonds-primary-market-api';
      child = spawn('npm', ['run', 'start:dev', '--workspace', workspaceName], {
        cwd: workspaceRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
        env: env
      });
    } else if (service.path.includes('apps/shared/gateway')) {
      const workspaceName = '@hashgraph/green-bonds-gateway';
      child = spawn('npm', ['run', 'start:dev', '--workspace', workspaceName], {
        cwd: workspaceRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
        env: env
      });
    } else if (service.path.includes('apps/shared/transaction-sender')) {
      const workspaceName = '@hashgraph/green-bonds-transaction-sender';
      child = spawn('npm', ['run', 'start:dev', '--workspace', workspaceName], {
        cwd: workspaceRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
        env: env
      });
    } else {
      // Fallback to local directory execution
      child = spawn('npm', ['run', 'start:dev'], {
        cwd: servicePath,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
        env: env
      });
    }

    let startupComplete = false;

    child.stdout.on('data', (data) => {
      const text = data.toString();
      
      // Log service output with prefix
      text.split('\n').forEach(line => {
        if (line.trim()) {
          log(`[${service.name}] ${line.trim()}`, colors.cyan);
        }
      });

      // Check for startup completion patterns
      if (!startupComplete && (
        text.includes('Application is running on') ||
        text.includes('Nest application successfully started') ||
        text.includes('server started on') ||
        text.includes('listening on port')
      )) {
        startupComplete = true;
        setTimeout(async () => {
          const isHealthy = await checkServiceHealth(service);
          if (isHealthy) {
            log(`✅ ${service.name} is ready on port ${service.port}`, colors.green);
            resolve({ process: child, healthy: true });
          } else {
            log(`⚠️  ${service.name} started but health check failed`, colors.yellow);
            resolve({ process: child, healthy: false });
          }
        }, 2000);
      }
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      log(`[${service.name}] ${text.trim()}`, colors.yellow);
    });

    child.on('error', (error) => {
      log(`❌ Failed to start ${service.name}: ${error.message}`, colors.red);
      reject(error);
    });

    child.on('exit', (code) => {
      if (!startupComplete) {
        log(`❌ ${service.name} exited with code ${code}`, colors.red);
        reject(new Error(`Service exited with code ${code}`));
      }
    });

    // Timeout for startup
    setTimeout(() => {
      if (!startupComplete) {
        log(`⏰ ${service.name} startup timeout`, colors.yellow);
        resolve({ process: child, healthy: false });
      }
    }, 30000);
  });
}

async function buildPackages() {
  log('📦 Building shared packages...', colors.cyan);
  const workspaceRoot = path.resolve(__dirname, '../../../');
  
  try {
    await execAsync(`npm run shared:build`, { cwd: workspaceRoot });
    log('✅ All packages built successfully', colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed to build packages: ${error.stderr || error.message}`, colors.red);
    return false;
  }
}

async function startNodeServices() {
  log('🚀 Starting Node.js API services...', colors.bright);

  // Build packages first
  const packagesBuilt = await buildPackages();
  if (!packagesBuilt) {
    log('⚠️  Warning: Package build failed, services may not work correctly', colors.yellow);
  }
  
  // Start ATS API and Primary Market API first, then Gateway (which proxies to both), then Transaction Sender
  const services = [CONFIG.atsApi, CONFIG.primaryMarketApi, CONFIG.gateway, CONFIG.transactionSender];
  const processes = [];

  for (const service of services) {
    try {
      const result = await startNodeService(service);
      processes.push({ name: service.name, ...result });
    } catch (error) {
      log(`❌ Failed to start ${service.name}: ${error.message}`, colors.red);
    }
  }

  return processes;
}

async function stopNodeProcessOnPort(port, serviceName) {
  try {
    let stdout;
    try {
      const result = await execAsync(`lsof -ti:${port}`);
      stdout = result.stdout;
    } catch (lsofError) {
      try {
        const result = await execAsync(`netstat -tulpn 2>/dev/null | grep :${port}`);
        const match = result.stdout.match(/(\d+)\/node/);
        stdout = match ? match[1] : '';
      } catch (netstatError) {
        log(`ℹ️  Could not find ${serviceName} process (port ${port})`, colors.blue);
        return false;
      }
    }
    
    const pids = stdout.trim().split('\n').filter(pid => pid && pid !== '');
    
    if (pids.length === 0) {
      log(`ℹ️  No ${serviceName} process found on port ${port}`, colors.blue);
      return false;
    }
    
    for (const pid of pids) {
      try {
        await execAsync(`kill -TERM ${pid}`);
        log(`✅ Stopped ${serviceName} (PID: ${pid})`, colors.green);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        try {
          await execAsync(`kill -KILL ${pid}`);
          log(`✅ Force stopped ${serviceName} (PID: ${pid})`, colors.green);
        } catch (forceError) {
          log(`⚠️  Could not stop process ${pid} for ${serviceName}`, colors.yellow);
        }
      }
    }
    return true;
  } catch (error) {
    log(`ℹ️  No ${serviceName} process found on port ${port}`, colors.blue);
    return false;
  }
}

async function checkInfrastructureStatus() {
  log('🔍 Checking infrastructure status...', colors.bright);
  log('=====================================\n', colors.bright);

  // Check Docker services
  log('🐳 Docker Services:', colors.cyan);
  for (const [key, service] of Object.entries(CONFIG.docker.services)) {
    const running = await isDockerServiceRunning(key);
    const healthy = running && (service.healthUrl ? await checkServiceHealth(service) : await checkDockerServiceHealth(key));
    
    log(`• ${service.name}: ${running ? '🟢 Running' : '🔴 Stopped'}${healthy ? ' (Healthy)' : running ? ' (Unhealthy)' : ''}`, 
      running && healthy ? colors.green : colors.red);
  }

  // Check Node.js services
  log('\n🚀 Node.js Services:', colors.cyan);
  const nodeServices = [CONFIG.atsApi, CONFIG.primaryMarketApi, CONFIG.gateway, CONFIG.transactionSender];
  for (const service of nodeServices) {
    const healthy = await checkServiceHealth(service);
    log(`• ${service.name}: ${healthy ? '🟢 Running' : '🔴 Stopped'}`, 
      healthy ? colors.green : colors.red);
  }

  log('\n🌐 Management UIs:', colors.blue);
  log('• PgAdmin: http://localhost:5050 (admin@admin.com/admin)');
  log('• RabbitMQ Management: http://localhost:15672 (guest/guest)');
}

async function stopAllInfrastructure() {
  log('🛑 Stopping all services...', colors.bright);
  
  // Stop Node.js processes
  log('\n🚀 Stopping Node.js services...', colors.cyan);
  await stopNodeProcessOnPort(3000, 'API Gateway');
  await stopNodeProcessOnPort(3001, 'ATS API');
  await stopNodeProcessOnPort(3002, 'Primary Market API');
  await stopNodeProcessOnPort(3005, 'Transaction Sender');
  
  // Stop Docker services
  log('\n🐳 Stopping Docker services...', colors.cyan);
  await stopDockerServices();
  
  log('\n✅ All services stopped', colors.green);
}

async function startFullInfrastructure() {
  log('🌱 Starting Green Bonds Infrastructure', colors.bright);
  log('====================================\n', colors.bright);

  // Check Docker
  const dockerOk = await checkDockerInstalled();
  if (!dockerOk) {
    log('❌ Docker is required for this setup', colors.red);
    return;
  }

  // Start Docker services first
  const dockerStarted = await startDockerServices();
  if (!dockerStarted) {
    log('❌ Failed to start Docker services', colors.red);
    return;
  }

  // Wait a bit for services to stabilize
  log('⏳ Waiting for services to stabilize...', colors.yellow);
  await new Promise(resolve => setTimeout(resolve, 5000));



  // Start Node.js APIs
  const processes = await startNodeServices();
  
  log('\n🎉 Infrastructure startup complete!', colors.bright);
  log('\n📊 Running services:', colors.green);
  
  for (const proc of processes) {
    if (proc.healthy) {
      log(`• ${proc.name}: Ready`, colors.green);
    } else {
      log(`• ${proc.name}: Started (health check failed)`, colors.yellow);
    }
  }

  log('\n🌐 Access Points:', colors.blue);
  log('• API Gateway: http://localhost:3000 (🔒 Requires x-api-key header)');
  log('• ATS API (Direct): http://localhost:3001/api/v1/ats');
  log('• ATS API Swagger (Direct): http://localhost:3001/api');
  log('• ATS API (via Gateway): http://localhost:3000/api/v1/ats');
  log('• Primary Market API (Direct): http://localhost:3002/api/v1/primary-markets');
  log('• Primary Market API Swagger (Direct): http://localhost:3002/api');
  log('• Primary Market API (via Gateway): http://localhost:3000/api/v1/primary-markets');
  log('• Transaction Sender: http://localhost:3005');
  log('• PgAdmin: http://localhost:5050 (admin@admin.com/admin)');
  log('• RabbitMQ: http://localhost:15672 (guest/guest)');
  
  log('\n🔑 API Keys (for gateway access):', colors.magenta);
  log('• demo-key-1');
  
  log('\n⚠️  Press Ctrl+C to stop all services', colors.yellow);

  // Keep the script running and handle graceful shutdown
  process.on('SIGINT', async () => {
    log('\n🛑 Shutting down infrastructure...', colors.yellow);
    
    // Stop child processes
    for (const proc of processes) {
      if (proc.process && !proc.process.killed) {
        proc.process.kill('SIGTERM');
      }
    }
    
    // Stop Docker services
    await stopDockerServices();
    
    log('✅ Infrastructure stopped', colors.green);
    process.exit(0);
  });

  // Keep the process alive
  setInterval(() => {}, 1000);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  const target = args[1];

  try {
    switch (command) {
      case 'start':
        if (target === 'docker') {
          const dockerOk = await checkDockerInstalled();
          if (dockerOk) await startDockerServices();
        } else if (target === 'apis' || target === 'api') {
          log('🚀 Starting Node.js APIs only...', colors.bright);
          const processes = await startNodeServices();
          log('\n✅ APIs started. Press Ctrl+C to stop.', colors.green);
          process.on('SIGINT', () => {
            for (const proc of processes) {
              if (proc.process && !proc.process.killed) {
                proc.process.kill('SIGTERM');
              }
            }
            log('\n✅ APIs stopped', colors.green);
            process.exit(0);
          });
          setInterval(() => {}, 1000);
        } else {
          await startFullInfrastructure();
        }
        break;
        
      case 'stop':
        await stopAllInfrastructure();
        break;
        
      case 'status':
        await checkInfrastructureStatus();
        break;
        
      default:
        log('🌱 Green Bonds Infrastructure Manager', colors.bright);
        log('===================================\n', colors.bright);
        log('Usage:', colors.blue);
        log('  node infra-setup-docker.js start         # Start full infrastructure (Docker + APIs)');
        log('  node infra-setup-docker.js start docker  # Start only Docker services');
        log('  node infra-setup-docker.js start apis    # Start only Node.js APIs');
        log('  node infra-setup-docker.js status        # Check status');
        log('  node infra-setup-docker.js stop          # Stop all services');
        log('\nExamples:', colors.blue);
        log('  node infra-setup-docker.js start         # Recommended: Full infrastructure');
        log('  node infra-setup-docker.js status        # Check what\'s running');
        break;
    }
  } catch (error) {
    log(`\n💥 Error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Auto-install axios if not available
try {
  require('axios');
} catch (error) {
  console.log('📦 Installing axios...');
  require('child_process').execSync('npm install axios', { stdio: 'inherit' });
}

main();