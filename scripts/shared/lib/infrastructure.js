const amqp = require("amqplib");
const { config, colors } = require("./config");
const { logSuccess, logError, log } = require("./logger");

async function publishSignedTransaction(signedTx, metadata = {}) {
  const format = config.BLOCKCHAIN_FORMAT;
  log(`\n🐰 Publishing ${format.toUpperCase()} transaction to RabbitMQ...`, colors.cyan);

  let connection, channel;

  try {
    connection = await amqp.connect(config.RABBITMQ_URL);
    channel = await connection.createChannel();

    const exchange = "tx";
    const queueName = `${format}Format.incoming`;
    const routingKey = `${format}Format.incoming`;

    await channel.assertExchange(exchange, "topic", { durable: true });

    const defaultMetadata = {
      requestId: `tx-${Date.now()}`,
      origin: "script",
      description: "Signed transaction",
    };

    const signedTransactionMessage = {
      payload: signedTx,
      metadata: { ...defaultMetadata, ...metadata },
      format: format,
    };

    const published = channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(signedTransactionMessage)), {
      persistent: true,
      headers: {
        format: format,
        "x-message-type": "SignedTransactionRequest",
      },
    });

    if (published) {
      logSuccess(`Message published to ${queueName}`);
      log(`   Exchange: ${exchange}`, colors.blue);
      log(`   Routing Key: ${routingKey}`, colors.blue);
      log(`   Payload: ${signedTransactionMessage.payload.substring(0, 50)}...`, colors.blue);
    } else {
      logError("Failed to publish message");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    logError(`RabbitMQ error: ${error.message}`);
    throw error;
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}

module.exports = {
  publishSignedTransaction,
};
