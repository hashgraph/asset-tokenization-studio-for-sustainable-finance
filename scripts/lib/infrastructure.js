const axios = require('axios');
const amqp = require('amqplib');
const { config, colors } = require('./config');
const { logSuccess, logError, logWarning, logInfo, log } = require('./logger');

async function checkAPIConnection() {
  logWarning('Checking ATS API connection...');
  
  try {
    await axios.get(`${config.ATS_API_URL}/api/v1/ats`, { 
      timeout: 2000,
      validateStatus: () => true 
    });
    logSuccess('ATS API is available');
    return true;
  } catch (error) {
    logError('ATS API is not available');
    logInfo('Please start: cd apps/ats/api && npm run start:dev');
    return false;
  }
}

async function checkRabbitMQConnection() {
  logWarning('Checking RabbitMQ connection...');
  
  try {
    const connection = await amqp.connect(config.RABBITMQ_URL);
    await connection.close();
    logSuccess('RabbitMQ is available');
    return true;
  } catch (error) {
    logError('RabbitMQ is not available');
    logInfo('Please start RabbitMQ: docker run -d --hostname my-rabbit --name some-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management');
    return false;
  }
}


async function publishSignedTransaction(signedTx, metadata = {}) {
  const format = config.BLOCKCHAIN_FORMAT;
  log(`\n🐰 Publishing ${format.toUpperCase()} transaction to RabbitMQ...`, colors.cyan);
  
  let connection, channel;
  
  try {
    connection = await amqp.connect(config.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    const exchange = 'tx';
    const queueName = `${format}Format.incoming`;
    const routingKey = `${format}Format.incoming`;
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    
    const defaultMetadata = {
      requestId: `tx-${Date.now()}`,
      origin: 'script',
      description: 'Signed transaction'
    };
    
    const signedTransactionMessage = {
      payload: signedTx,
      metadata: { ...defaultMetadata, ...metadata },
      format: format
    };
    
    const published = channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(signedTransactionMessage)),
      {
        persistent: true,
        headers: {
          format: format,
          'x-message-type': 'SignedTransactionRequest'
        }
      }
    );
    
    if (published) {
      logSuccess(`Message published to ${queueName}`);
      log(`   Exchange: ${exchange}`, colors.blue);
      log(`   Routing Key: ${routingKey}`, colors.blue);
      log(`   Payload: ${signedTransactionMessage.payload.substring(0, 50)}...`, colors.blue);
    } else {
      logError('Failed to publish message');
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    logError(`RabbitMQ error: ${error.message}`);
    throw error;
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}

async function checkInfrastructure() {
  logWarning('Checking infrastructure for Bond Creation Simulator...');
  const apiOk = await checkAPIConnection();
  const rabbitOk = await checkRabbitMQConnection();
  
  if (!apiOk || !rabbitOk) {
    logInfo('Infrastructure Setup Required:');
    logInfo('   Run: node scripts/infra-setup.js start');
    logInfo('   Or use the individual service commands:');
    log('\n   This will automatically start:', colors.blue);
    log('   • ATS API (Bond management)');
    log('   • Transaction Sender (Message processing)');
    log('   • RabbitMQ (Docker container, if available)');
    
    if (!apiOk) {
      logError('ATS API is not available');
    }
    
    if (!rabbitOk) {
      logError('RabbitMQ is not available');
    }
    
    log('\n🔧 Manual alternative:', colors.yellow);
    log('   1. Start RabbitMQ: docker run -d --name green-bonds-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management');
    log('   2. Start ATS API: cd apps/ats/api && npm run start:dev');
    log('   3. Start Transaction Sender: cd apps/shared/transaction-sender && npm run start:dev');
    
    return false;
  }
  
  logSuccess('Infrastructure OK!');
  return true;
}

module.exports = {
  checkAPIConnection,
  checkRabbitMQConnection,
  publishSignedTransaction,
  checkInfrastructure
};