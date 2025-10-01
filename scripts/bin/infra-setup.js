#!/usr/bin/env node

/**
 * Infrastructure Setup Script for Green Bonds Platform
 * 
 * This script manages the infrastructure components required for the demo:
 * 1. RabbitMQ (via Docker)
 * 2. ATS API
 * 3. Transaction Sender
 * 
 * Usage:
 *   node infra-setup.js start           # Start all infrastructure
 *   node infra-setup.js stop            # Stop all infrastructure 
 *   node infra-setup.js status          # Check status of all components
 *   node infra-setup.js start rabbitmq  # Start only RabbitMQ
 *   node infra-setup.js start api       # Start only APIs
 */

const { spawn, exec } = require('child_process');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  rabbitmq: {
    containerName: 'green-bonds-rabbitmq',
    image: 'rabbitmq:3-management',
    ports: ['5672:5672', '15672:15672'],
    env: {
      RABBITMQ_DEFAULT_USER: 'guest',
      RABBITMQ_DEFAULT_PASS: 'guest'
    },
    healthUrl: 'http://localhost:15672/api/overview'
  },
  atsApi: {
    name: 'ATS API',
    path: 'apps/ats/api',
    port: 3000,
    healthUrl: 'http://localhost:3000/api/v1/ats',
    command: 'npm run start:dev'
  },
  transactionSender: {
    name: 'Transaction Sender',
    path: 'apps/shared/transaction-sender',
    port: 3005,
    healthUrl: 'http://localhost:3005',
    command: 'npm run start:dev'
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
    return true;
  } catch (error) {
    log('❌ Docker is not installed or not running', colors.red);
    log('   Please install Docker: https://docs.docker.com/get-docker/', colors.yellow);
    return false;
  }
}

async function checkNodeModules(servicePath) {
  // Get project root directory (parent of scripts folder)
  const projectRoot = path.dirname(process.cwd());
  const nodeModulesPath = path.join(projectRoot, servicePath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log(`📦 Installing dependencies for ${servicePath}...`, colors.yellow);
    try {
      await execAsync('npm install', { cwd: path.join(projectRoot, servicePath) });
      log(`✅ Dependencies installed for ${servicePath}`, colors.green);
      return true;
    } catch (error) {
      log(`❌ Failed to install dependencies for ${servicePath}: ${error.error.message}`, colors.red);
      return false;
    }
  }
  return true;
}

async function isRabbitMQRunning() {
  try {
    const { stdout } = await execAsync(`docker ps -q -f name=${CONFIG.rabbitmq.containerName}`);
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

async function startRabbitMQ() {
  log('🐰 Starting RabbitMQ...', colors.cyan);
  
  const isRunning = await isRabbitMQRunning();
  if (isRunning) {
    log('✅ RabbitMQ is already running', colors.green);
    return true;
  }

  try {
    // Remove existing container if it exists (stopped)
    try {
      await execAsync(`docker rm ${CONFIG.rabbitmq.containerName}`);
    } catch (error) {
      // Container doesn't exist, that's fine
    }

    // Start RabbitMQ container
    const envFlags = Object.entries(CONFIG.rabbitmq.env)
      .map(([key, value]) => `-e ${key}=${value}`)
      .join(' ');
    
    const portFlags = CONFIG.rabbitmq.ports
      .map(port => `-p ${port}`)
      .join(' ');

    const command = `docker run -d --hostname green-bonds-rabbit --name ${CONFIG.rabbitmq.containerName} ${envFlags} ${portFlags} ${CONFIG.rabbitmq.image}`;
    
    await execAsync(command);
    
    log('⏳ Waiting for RabbitMQ to be ready...', colors.yellow);
    
    // Wait for RabbitMQ to be ready
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const response = await axios.get(CONFIG.rabbitmq.healthUrl, {
          auth: { username: 'guest', password: 'guest' },
          timeout: 2000
        });
        if (response.status === 200) {
          log('✅ RabbitMQ is ready', colors.green);
          log('🌐 RabbitMQ Management UI: http://localhost:15672 (guest/guest)', colors.blue);
          return true;
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          log('❌ RabbitMQ failed to start within timeout', colors.red);
          return false;
        }
      }
    }
  } catch (error) {
    log(`❌ Failed to start RabbitMQ: ${error.error?.message || error.message}`, colors.red);
    return false;
  }
}

async function stopRabbitMQ() {
  log('🐰 Stopping RabbitMQ...', colors.cyan);
  
  try {
    await execAsync(`docker stop ${CONFIG.rabbitmq.containerName}`);
    await execAsync(`docker rm ${CONFIG.rabbitmq.containerName}`);
    log('✅ RabbitMQ stopped', colors.green);
    return true;
  } catch (error) {
    log('⚠️  RabbitMQ container not found or already stopped', colors.yellow);
    return true;
  }
}

async function checkServiceHealth(service) {
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

function startService(service) {
  return new Promise((resolve, reject) => {
    log(`🚀 Starting ${service.name}...`, colors.blue);
    
    // Get project root directory (parent of scripts folder)
    const projectRoot = path.dirname(process.cwd());
    const servicePath = path.join(projectRoot, service.path);
    
    if (!fs.existsSync(servicePath)) {
      log(`❌ Service path not found: ${servicePath}`, colors.red);
      reject(new Error(`Service path not found: ${servicePath}`));
      return;
    }

    const child = spawn('npm', ['run', 'start:dev'], {
      cwd: servicePath,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      detached: false
    });

    let startupComplete = false;
    let output = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
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

async function startAPIs() {
  log('🚀 Starting APIs...', colors.bright);

  const services = [CONFIG.atsApi, CONFIG.transactionSender];
  const processes = [];

  for (const service of services) {
    // Check if dependencies are installed
    const depsOk = await checkNodeModules(service.path);
    if (!depsOk) {
      continue;
    }

    try {
      const result = await startService(service);
      processes.push({ name: service.name, ...result });
    } catch (error) {
      log(`❌ Failed to start ${service.name}: ${error.message}`, colors.red);
    }
  }

  return processes;
}

async function checkInfrastructureStatus() {
  log('🔍 Checking infrastructure status...', colors.bright);
  log('=====================================\n', colors.bright);

  // Check RabbitMQ
  const rabbitRunning = await isRabbitMQRunning();
  const rabbitHealthy = rabbitRunning ? await checkServiceHealth({ healthUrl: CONFIG.rabbitmq.healthUrl }) : false;
  
  log(`🐰 RabbitMQ: ${rabbitRunning ? '🟢 Running' : '🔴 Stopped'}${rabbitHealthy ? ' (Healthy)' : rabbitRunning ? ' (Unhealthy)' : ''}`, 
    rabbitRunning && rabbitHealthy ? colors.green : colors.red);

  // Check APIs
  for (const [key, service] of Object.entries(CONFIG)) {
    if (key === 'rabbitmq') continue;
    
    const healthy = await checkServiceHealth(service);
    log(`${key === 'atsApi' ? '📋' : '⚡'} ${service.name}: ${healthy ? '🟢 Running' : '🔴 Stopped'}`, 
      healthy ? colors.green : colors.red);
  }

  log('\n📊 Infrastructure Summary:', colors.bright);
  log(`• RabbitMQ: ${rabbitRunning && rabbitHealthy ? 'Ready' : 'Not Available'}`, 
    rabbitRunning && rabbitHealthy ? colors.green : colors.red);
  log(`• APIs: Check individual status above`, colors.blue);
  
  if (rabbitRunning && rabbitHealthy) {
    log('\n🌐 Management UIs:', colors.blue);
    log('• RabbitMQ Management: http://localhost:15672 (guest/guest)');
  }
}

async function stopNodeProcessOnPort(port, serviceName) {
  try {
    // Find process using the port (try lsof first, then netstat as fallback)
    let stdout;
    try {
      const result = await execAsync(`lsof -ti:${port}`);
      stdout = result.stdout;
    } catch (lsofError) {
      // Fallback to netstat for systems without lsof
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
    
    // Kill each process
    for (const pid of pids) {
      try {
        await execAsync(`kill -TERM ${pid}`);
        log(`✅ Stopped ${serviceName} (PID: ${pid})`, colors.green);
        
        // Wait a moment and verify it's stopped
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        // Try force kill if graceful kill fails
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

async function stopAllInfrastructure() {
  log('🛑 Stopping services...', colors.bright);
  
  // Stop API processes
  log('\n📋 Stopping API services...', colors.cyan);
  await stopNodeProcessOnPort(3000, 'ATS API');
  await stopNodeProcessOnPort(3005, 'Transaction Sender');
  
  // Stop RabbitMQ container
  log('\n🐰 Stopping RabbitMQ container...', colors.cyan);
  const rabbitRunning = await isRabbitMQRunning();
  if (rabbitRunning) {
    await stopRabbitMQ();
  } else {
    log('ℹ️  RabbitMQ container not found', colors.blue);
  }
  
  log('\n✅ Stop command completed', colors.green);
  log('💡 Run "npm run status" to verify all services are stopped', colors.cyan);
}

async function startFullInfrastructure() {
  log('🌱 Starting Green Bonds APIs', colors.bright);
  log('=============================\n', colors.bright);

  // Check if RabbitMQ is available (optional)
  const rabbitRunning = await isRabbitMQRunning();
  if (!rabbitRunning) {
    log('⚠️  RabbitMQ not detected. Starting simple RabbitMQ container...', colors.yellow);
    
    const dockerOk = await checkDockerInstalled();
    if (dockerOk) {
      const rabbitOk = await startRabbitMQ();
      if (!rabbitOk) {
        log('⚠️  RabbitMQ failed to start, but continuing with APIs...', colors.yellow);
      }
    } else {
      log('⚠️  Docker not available. RabbitMQ must be started manually for full demo.', colors.yellow);
      log('   Quick start: docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management', colors.cyan);
    }
  } else {
    log('✅ RabbitMQ already running', colors.green);
  }

  // Start APIs (main focus)
  const processes = await startAPIs();
  
  log('\n🎉 APIs startup complete!', colors.bright);
  log('\n📊 Running services:', colors.green);
  
  const rabbitHealthy = await checkServiceHealth({ healthUrl: CONFIG.rabbitmq.healthUrl });
  if (rabbitHealthy) {
    log('• RabbitMQ: http://localhost:15672 (guest/guest)', colors.blue);
  } else {
    log('• RabbitMQ: Not available (demo will have limited functionality)', colors.yellow);
  }
  
  for (const proc of processes) {
    if (proc.healthy) {
      log(`• ${proc.name}: Ready`, colors.green);
    } else {
      log(`• ${proc.name}: Started (health check failed)`, colors.yellow);
    }
  }

  log('\n💡 APIs are ready!', colors.bright);
  log('   Run: node complete-demo.js', colors.cyan);
  
  log('\n⚠️  Press Ctrl+C to stop all services', colors.yellow);

  // Keep the script running and handle graceful shutdown
  process.on('SIGINT', async () => {
    log('\n🛑 Shutting down APIs...', colors.yellow);
    
    // Stop child processes
    for (const proc of processes) {
      if (proc.process && !proc.process.killed) {
        proc.process.kill('SIGTERM');
      }
    }
    
    log('✅ APIs stopped', colors.green);
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
        if (target === 'rabbitmq') {
          const dockerOk = await checkDockerInstalled();
          if (dockerOk) await startRabbitMQ();
        } else if (target === 'api' || target === 'apis') {
          log('🚀 Starting APIs only...', colors.bright);
          const processes = await startAPIs();
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
        log('🚀 Green Bonds API Manager', colors.bright);
        log('===========================\n', colors.bright);
        log('Usage:', colors.blue);
        log('  node infra-setup.js start           # Start APIs + RabbitMQ (if Docker available)');
        log('  node infra-setup.js start api       # Start only APIs');
        log('  node infra-setup.js start rabbitmq  # Start only RabbitMQ');
        log('  node infra-setup.js status          # Check status');
        log('  node infra-setup.js stop            # Stop services');
        log('\nExamples:', colors.blue);
        log('  node infra-setup.js start           # Recommended: Start APIs with optional RabbitMQ');
        log('  node infra-setup.js start api       # Just APIs (RabbitMQ separate)');
        log('  node infra-setup.js status          # Check what\'s running');
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