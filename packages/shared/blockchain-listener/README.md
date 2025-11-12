# Blockchain Listener

This package listens to on-chain events from Hedera Mirror Node and persists them into the EventStore. It also exposes a configurable RabbitMQ publisher (via `@golevelup/nestjs-rabbitmq`) to forward domain DLT events to your message bus.

## RabbitMQ Publishing

Inbound publishing uses `PublishEventPortNestJSEventAdapter`, which listens to `*DLTEvent` via NestJS EventEmitter and delegates to the outbound `EventPublisherPort` implemented by `RabbitMQEventPublisherAdapter`. Messages are published as JSON to a configured exchange and routing key composed by a base plus the `eventName`.

### Environment Variables

These variables follow the same conventions as the `transaction-sender` package where possible:

- `RABBITMQ_URI` or `RABBITMQ_URL`: RabbitMQ connection URI (e.g., `amqp://localhost:5672`).
- `RABBITMQ_EXCHANGE_NAME`: Exchange name to publish to (default: `greenbond.events`).
- `RABBITMQ_CONNECTION_WAIT`: Whether to wait for connection on bootstrap (`true|false`, default: `false`).
- `RABBITMQ_BLOCKCHAIN_ROUTING_KEY`: Base routing key for blockchain events (default: `blockchain.events`).
- `RABBITMQ_PUBLISH_ENABLED`: Toggle to enable/disable publishing (`true|false`, default: `true`).

### Message Format

Published message (generic DLT event):
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
