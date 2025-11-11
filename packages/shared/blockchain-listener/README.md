# Blockchain Listener

This package listens to on-chain events from Hedera Mirror Node and persists them into the EventStore. It also exposes a configurable RabbitMQ publisher to forward processed events to your message bus.

## RabbitMQ Publishing

When an on-chain event is processed and stored, an `EventProcessedEvent` is emitted. The `BlockchainEventsRabbitPublisher` listens for this event and publishes a JSON message to a RabbitMQ exchange.

By default, only the processed summary is published. Optionally, you can enable publishing of the raw event payload stored in the EventStore.

### Environment Variables

These variables follow the same conventions as the `transaction-sender` package where possible:

- `RABBITMQ_URI` or `RABBITMQ_URL`: RabbitMQ connection URI (e.g., `amqp://localhost:5672`). If not provided, publishing is disabled gracefully.
- `RABBITMQ_EXCHANGE_NAME`: Exchange name to publish to (default: `greenbond.events`).
- `RABBITMQ_EXCHANGE_TYPE`: Exchange type (default: `topic`).
- `RABBITMQ_BLOCKCHAIN_EVENTS_ROUTING_KEY`: Routing key for processed events (default: `blockchain.events.processed`).
- `BLOCKCHAIN_LISTENER_RABBITMQ_PUBLISH_RAW`: Set to `true` to also publish raw event payload (default: `false`).
- `RABBITMQ_BLOCKCHAIN_EVENTS_RAW_ROUTING_KEY`: Routing key for raw events (default: `blockchain.events.raw`).
- `BLOCKCHAIN_LISTENER_RABBITMQ_PERSISTENT`: Set to `false` to disable persistent messages (default: `true`).

### Message Format

Processed event message:
```
{
  "id": "<eventStoreId>",
  "eventName": "<name>",
  "status": "PROCESSED|FAILED",
  "errorReason": "<string|null>",
  "timestamp": "<ISO8601>"
}
```

Raw event message (when enabled):
```
{
  "id": "<eventStoreId>",
  "eventName": "<name>",
  "raw": "<JSON string as saved in EventStore>",
  "timestamp": "<ISO8601>"
}
```

### Usage

Import `BlockchainEventListenerModule` in your NestJS AppModule. The publisher is included as a provider and will be automatically activated:

```
imports: [SharedModule, BlockchainEventListenerModule]
```

Ensure your application has the required environment variables set so the publisher can connect to RabbitMQ.