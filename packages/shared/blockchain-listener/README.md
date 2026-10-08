# Blockchain Listener

## Description

This package listens to smart contract events from Hedera Mirror Node and sends them for the backend to consume. Event can also be sent to a RabbitMQ queue.

## Configure .env

The properties the library export for the applications are the following:

- `HEDERA_NETWORK`: Hedera network to connect to. Can be testnet, previewnet or mainnet (default value: `tesnet`).
- `BLOCKCHAIN_LISTENER_BLOCK_NUMBER`: Block number the library will start listening events from. This can be used in case you want to start listening events from a specific block number. Usually should be empty (default: `empty`).
- `BLOCKCHAIN_LISTENER_POLL_INTERVAL`: Time interval in milliseconds the listener will wait for a new block to be included in the network (default: `3000` (3 seconds))
- `BLOCKCHAIN_LISTENER_CONTRACTS`: List of semicolon separated contract addresses in EVM format the library will listen events from.
  This property is for the contract addresses that are fixed for each environment, e.g. for factories. Each value should have a corresponding value in the same position in the `BLOCKCHAIN_LISTENER_EVENTS` property (default: `empty`).
- `BLOCKCHAIN_LISTENER_EVENTS`: List of semicolon separated event signatures related to the corresponding smart contract address. The signature is the signature of the event in Solidity including indexed keywords and parameter names (default: `empty`).
- `RABBITMQ_PUBLISH_ENABLED`: Toggle to enable/disable publishing events to RabbitMQ. When false, there is no need to set other RabbitMQ properties (`true|false`, default: `true`).
- `RABBITMQ_URI`: RabbitMQ connection URI (default: `amqp://localhost:5672`).
- `RABBITMQ_EXCHANGE_NAME`: Exchange name to publish to (default: `greenbond.events`).
- `RABBITMQ_CONNECTION_WAIT`: Whether to wait for connection on bootstrap. If true, server will fail to start if connection fails. Recommendation is to set it to false (`true|false`, default: `false`).
- `RABBITMQ_BLOCKCHAIN_ROUTING_KEY`: Base routing key for blockchain events. The complete routing key the event will be published to includes the name of the event, for example, for the event Transfer, having this property as blockchain.events, will be blockchain.events.Transfer (default: `blockchain.events`).

## Message Format

Published message:

```
{
  "eventName": "<name>",
  ...eventFields,
  "timestamp": "<ISO8601>"
}
```

Routing key is composed as: `<RABBITMQ_BLOCKCHAIN_ROUTING_KEY>.<eventName>`; for example: `blockchain.events.RoleGranted`.

### Usage

Import `BlockchainEventListenerModule` in your NestJS AppModule. The publisher and its RabbitMQ configuration are included and activated according to environment variables:

```
imports: [SharedModule, BlockchainEventListenerModule]
```

Ensure your application has the required environment variables set so the publisher can connect to RabbitMQ. If `RABBITMQ_PUBLISH_ENABLED=false`, events will not be published.
