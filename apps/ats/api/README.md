# GREEN BONDS ATS API

## Description

A nestjs application for managing Green Bonds assets in Hedera or EVM blockchain.

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
$ nest new ats-api
$ rm -rf .git
$ npm i --save @nestjs/config
$ npm install --save @nestjs/typeorm typeorm pg
$ npm install --save nestjs-paginate
$ npm install --save @nestjs/swagger
```

## Configure .env
You can copy .env.example to .env to have every property that the application is going to need.
- PORT: the port where the app is going to be listening
- LOG_LEVELS: list of log levels that you want to write, possible values log,error,warn,debug,verbose
- HEDERA_NETWORK: possible values testnet, previewnet or mainnet
- POSTGRESQL_HOST: host where the database is listening connections
- POSTGRESQL_PORT: port where the database is listening connections
- POSTGRESQL_USER: database user to connect
- POSTGRESQL_PASSWORD: database password to connect
- POSTGRESQL_DB: database schema
- BLOCKCHAIN_LISTENER_NETWORK: possible values testnet, previewnet or mainnet
- BLOCKCHAIN_LISTENER_BLOCK_NUMBER: block where the app is going to start listening
- BLOCKCHAIN_LISTENER_POLL_INTERVAL: time in milliseconds to wait when there is not a new block available
- BLOCKCHAIN_LISTENER_CONTRACTS: list of already deployed contracts that the app is going to listen events (factories for example)
- BLOCKCHAIN_LISTENER_EVENTS: list of events that the app is going to listen from the LISTENER_CONTRACTS

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

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).


## License

Green Bond ATS API is [Apache 2.0 licensed](../../..//LICENSE).
