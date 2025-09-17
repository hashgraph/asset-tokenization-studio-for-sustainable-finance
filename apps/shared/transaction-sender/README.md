# Transaction Sender - RabbitMQ Message Processing

## Overview

This implementation provides a clean, efficient RabbitMQ message processing system that subscribes to blockchain transaction queues and forwards messages to the `TransactionService` for processing. The architecture follows Hexagonal Architecture and DDD principles with automatic validation and minimal boilerplate.

## Architecture

The implementation follows Hexagonal Architecture and DDD principles:

```
port.adapter/
├── in/
│   ├── RabbitMQIncomingAdapter.ts   # Main queue subscriber (simplified)
│   └── RabbitMQIncomingPort.ts      # Port interface

app/
├── service/
│   └── TransactionService.ts        # Application coordination (streamlined)
├── command/
│   └── send-signed-transaction/     # Command handlers
└── event/
    └── publish-transaction-result/  # Event handlers

domain/
├── model/
│   ├── SignedTransactionMessage.ts      # Base domain model
│   ├── SignedTransactionWithFormat.ts   # Format-specific model
│   └── TransactionMetadata.ts           # Metadata model
└── service/                             # Domain services
```

## Core Features

### ✅ RabbitMQIncomingAdapter (Optimized)
- **Queue Subscriptions**: Listens to `hederaFormat.incoming` and `ethereumFormat.incoming`
- **Automatic Validation**: NestJS + class-validator handles validation automatically
- **Clean Architecture**: Simplified code with single responsibility
- **Basic Logging**: Logs incoming messages with requestId correlation
- **Error Handling**: Leverages NestJS built-in error handling

### ✅ Automatic Message Validation
- **Input Validation**: Automatic validation via class-validator decorators
- **Format Validation**: Built-in validation for different blockchain formats
- **Type Safety**: Strong TypeScript typing throughout the pipeline
- **No Redundancy**: Single point of validation at message entry

## Dependencies

All required dependencies are installed:

- `@golevelup/nestjs-rabbitmq` - RabbitMQ integration for NestJS
- `@nestjs/cqrs` - CQRS module for command and query handling
- `class-transformer` & `class-validator` - Data validation and transformation

## Configuration

### Environment Variables
- `RABBITMQ_URI`: RabbitMQ connection string (default: `amqp://localhost:5672`)

### Queue Configuration
- **Exchange**: `tx` (topic type)
- **Hedera Queue**: `hederaFormat.incoming`
- **Ethereum Queue**: `ethereumFormat.incoming`

## Message Format

### Incoming Message
```json
{
  "payload": "0x0abc123...",
  "metadata": {
    "origin": "evercity",
    "description": "Bond creation",
    "requestId": "abc123-def456"
  },
  "format": "hedera"
}
```

### Validation Rules (Automatic)
1. **payload**: Must be a non-empty string (validated by `@IsNotEmpty()`)
2. **metadata**: Must be a valid TransactionMetadata object
3. **requestId**: Required for correlation and logging (validated by `@IsString()`)
4. **format**: Must be either 'hedera' or 'ethereum' (validated by `@IsIn(['hedera', 'ethereum'])`)

### Supported Formats
- **hedera**: For Hedera Hashgraph transactions
- **ethereum**: For Ethereum-compatible transactions

> **Note**: All validation is handled automatically by NestJS + class-validator at the message entry point. No manual validation needed in business logic.

## Usage

Once dependencies are installed, uncomment the imports in `AppModule.ts`:

```typescript
@Module({
  imports: [
    CqrsModule,
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [{ name: 'tx', type: 'topic' }],
      uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
    }),
  ],
  // ... rest of configuration
})
```

## Testing

The streamlined implementation can be tested with:

1. **Valid Messages**: Send properly formatted messages to verify automatic processing
2. **Invalid Formats**: Test automatic validation with invalid format values
3. **Missing Fields**: Test class-validator automatic rejection of incomplete messages
4. **Error Scenarios**: Verify NestJS built-in error handling and logging

## Benefits of Current Architecture

### ✅ **Simplified & Clean**
- Removed redundant validation code
- Single responsibility per class
- Leverages NestJS built-in features

### ✅ **Better Performance**
- No duplicate validation
- Automatic serialization/deserialization
- Optimized message processing

### ✅ **Maintainable**
- Less code to maintain
- Standard NestJS patterns
- Clear separation of concerns

### ✅ **Type Safe**
- Strong TypeScript typing
- Compile-time error detection
- IDE support and autocomplete

## Next Steps

1. **Environment Setup**: Configure RabbitMQ connection string in environment variables
2. **RabbitMQ Broker**: Set up RabbitMQ server and create the required exchanges/queues
3. **Integration Testing**: Test with actual RabbitMQ broker and message flows
4. **Monitoring**: Add metrics and health checks for production readiness
5. **Business Logic**: Implement actual transaction processing logic in TransactionService

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
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
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
