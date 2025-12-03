# Transaction Sender

## Description

A NestJS application that receives signed transactions in RabbitMQ queues and sends them to the blockchain in Hedera o Ethereum format, publishing the result in another RabbitMQ queue.

## Architecture

This application follows Hexagonal Architecture and DDD principles:

```
config/                                         # Modules configuration

port.adapter/
├── <aggregated#1>                              # Group ports & adapters by aggregated
│   ├──usecase/                                 # In ports & adapters
│   |   ├──<functionallity#1>                   # Group port & adapter by functionallity
│   |   |   ├── <functionallity#1>Adapter.ts    # Adapter (port implementation)
│   |   |   └── <functionallity#1>Port.ts       # Port interface
│   └──out>                                     # Out ports & adapters
│   |   └──<functionallity#2>
|   |   |   ├── <functionallity#2>Adapter.ts
|   |   |   └── <functionallity#2Port.ts

app/
├──<aggregated#1>                                   # Group commands, queries & services by aggregated
|   |   ├── <functionallity#1>/                         
|   |   |   ├── <query>/                         
│   |   |   |   ├── <functionallity#1>Query.ts
|   |   |   ├── command/
│   |   |   |   └── <functionallity#2>Command.ts
|   |   |   ├── service/                            # For example validations for queries & commands
│   |   |   |   ├── <functionallity#1>Service.ts

domain/
├──<aggregated#1>                        # Group custom errors, events, models, services & repositories by aggregated
|   ├── error/
|   ├── event/
|   ├── model/
|   ├── service/                         # For example validations for repositories
|   └── repository/
```
## Configure .env
You can copy .env.example to .env to have every property that the application is going to need.

- `RABBITMQ_URI`: RabbitMQ connection string (default: `amqp://localhost:5672`)
- `RABBITMQ_EXCHANGE_NAME`: Exchange name (default: `tx`)
- `RABBITMQ_EXCHANGE_TYPE`: Exchange type (default: `topic`)
- `RABBITMQ_HEDERA_QUEUE_NAME`: Hedera format incoming messages queue name (default: `hederaFormat.incoming`)
- `RABBITMQ_HEDERA_ROUTING_KEY`: Hedera format incoming messages routing key (default: `hederaFormat.incoming`)
- `RABBITMQ_HEDERA_OUTGOING_ROUTING_KEY`: Hedera format outgoing messages routing key (default: `hederaFormat.outgoing`)
- `RABBITMQ_ETHEREUM_QUEUE_NAME`: Ethereum format incoming messages queue name (default: `ethereumFormat.incoming`)
- `RABBITMQ_ETHEREUM_ROUTING_KEY`: Ethereum format incoming messages routing key (default: `ethereumFormat.incoming`)
- `RABBITMQ_ETHEREUM_OUTGOING_ROUTING_KEY`: Ethereum format outgoing messages routing key (default: `ethereumFormat.outgoing`)
- `RABBITMQ_CONNECTION_WAIT`: Whether to wait for connection on bootstrap. If true, server will fail to start if connection fails. Recommendation is to set it to false (`true|false`, default: `false`).

## Message Format

### Incoming Message
```json
{
  "payload": "0x0abc123...",
  "metadata": {
    "origin": "evercity",
    "description": "Bond creation",
    "requestId": "tx-1764689887954"
  },
  "format": "hedera"
}
```

### Outgoing Message with transaction result
```json
{
  "payload": "0x0abc123...",
  "metadata": {
    "requestId": "tx-1764689887954",
    "origin": "script",
    "description": "Signed transaction"
  },
  "format": "hedera",
  "transactionHash": "0.0.7097609@1764689887.901000000",
  "status": "success",
  "errorCode": null
}
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# development watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# run tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Health Check Endpoint
A health check endpoint is available under `api/v1/health`.

## API Doc Endpoint
An API documentation endpoint is available under `api/v1/docs`.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).


## License

Green Bond Transaction Sender is [Apache 2.0 licensed](../../..//LICENSE).