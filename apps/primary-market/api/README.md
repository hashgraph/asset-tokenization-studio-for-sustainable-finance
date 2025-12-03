# GREEN BONDS PRIMARY MARKET API

## Description

A nestjs application for managing Green Bonds primary market in Hedera or EVM blockchain.

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

## How this project has been created
```bash
$ nest new primary-market
$ rm -rf .git
$ npm i --save @nestjs/config
$ npm install --save @nestjs/typeorm typeorm pg
$ npm install --save nestjs-paginate
$ npm install --save @nestjs/swagger
```
## Configure .env
You can copy .env.example to .env to have every property that the application is going to need.

- `PORT`: The port where the app is going to be listening (default: `3000`).
- `LOG_LEVEL`: Log level of the application. The level indicated includes higher level in this list of levels: `"verbose", "debug", "log", "warn", "error", "fatal"`, for example log level includes warn, error and fatal levels.
- `HEDERA_NETWORK`: Hedera network to connect to. Can be testnet, previewnet or mainnet  (default value: `tesnet`).
- `POSTGRESQL_HOST`: Host where the database is listening connections (default: `localhost`).
- `POSTGRESQL_PORT`: Port where the database is listening connections (default: `5432`).
- `POSTGRESQL_USER`: Database user to connect (default: `postgres`)
- `POSTGRESQL_PASSWORD`: Database password to connect (default: `postgres`)
- `POSTGRESQL_DB`: Database name (default: `postgres`)
- `BLOCKCHAIN_LISTENER_BLOCK_NUMBER`: Block number the library will start listening events from. This can be used in case you want to start listening events from a specific block number. Usually should be empty (default: `empty`).
- `BLOCKCHAIN_LISTENER_POLL_INTERVAL`: Time interval in milliseconds the listener will wait for a new block to be included in the network (default: `3000` (3 seconds))
- `BLOCKCHAIN_LISTENER_CONTRACTS`: List of semicolon separated contract addresses in EVM format the library will listen events from.
  This property is for the contract addresses that are fixed for each environment, e.g. for factories. Each value should have a corresponding value in the same position in the `BLOCKCHAIN_LISTENER_EVENTS` property (default: `empty`).
- `BLOCKCHAIN_LISTENER_EVENTS`: List of semicolon separated event signatures related to the corresponding smart contract address. The signature is the signature of the event in Solidity including indexed keywords and parameter names (use default value in .env.example).
- `RABBITMQ_PUBLISH_ENABLED`: Toggle to enable/disable publishing events to RabbitMQ. When false, there is no need to set other RabbitMQ properties (`true|false`, default: `true`).
- `RABBITMQ_URI`: RabbitMQ connection URI (default: `amqp://localhost:5672`).
- `RABBITMQ_EXCHANGE_NAME`: Exchange name to publish to (default: `greenbond.events`).
- `RABBITMQ_CONNECTION_WAIT`: Whether to wait for connection on bootstrap. If true, server will fail to start if connection fails. Recommendation is to set it to false (`true|false`, default: `false`).
- `RABBITMQ_BLOCKCHAIN_ROUTING_KEY`: Base routing key for blockchain events. The complete routing key the event will be published to includes the name of the event, for example, for the event Transfer, having this property as blockchain.events, will be blockchain.events.Transfer (default: `blockchain.events`).

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
# run tests (e2e tests excluded)
$ npm run test

# only run e2e tests
$ npm run test:e2e

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

Green Bond Primary Market API is [Apache 2.0 licensed](../../..//LICENSE).
