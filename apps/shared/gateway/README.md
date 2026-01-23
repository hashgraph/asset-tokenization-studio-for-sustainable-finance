# Gateway

## Description

A NestJS application that acts as an API Gateway for the 3 APIs of the solution, ats, primary-market and treasury.

## Configure .env

You can copy .env.example to .env to have every property that the application is going to need.

- `PORT`: The port where the app is going to be listening (default: `3000`).
- `LOG_LEVEL`: Log level of the application. The level indicated includes higher level in this list of levels: `"verbose", "debug", "log", "warn", "error", "fatal"`, for example log level includes warn, error and fatal levels.
- `PATHS`: Comma separated paths of the APIs this gateway routes. Each value should have a corresponding value in the same position in the `ROUTES` property.
  Should be the same value as configured in the example env file. Treasury API have 3 different paths, ATS and Primary Market only 1 (default: `empty`).
- `ROUTES`: Comma separated list of routes this API Gateway will route to for each received path configured in ´PATHS´ property. We should take into account that treasury route should be repeated 3 times.(default: `empty`).
- `API_KEY_HEADER_NAME`: Header name that will be used for authentication (default: `X-API-Key`)
- `API_KEYS`: Comma separated list of valid API keys that can be used for authentication. (default: `30000` (30 seconds))
- `TIMEOUT`: Timeout in milliseconds the Gateway should wait for the API call before a timeout error.
- `LOG_RESPONSE_BODY_LIMIT`: Max char number that will be logged for each call (default: `500`)

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

A health check endpoint is available under `api/v1/health`. All of the 3 APIs (ats, primary-market and treasury) will be checked in the Gateway health check.

## API Doc Endpoint

An API documentation endpoint is available under `api/v1/docs`. This will serve the API doc of the 3 APIs (ats, primary-market and treasury) in the same page in the browser.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).

## License

Green Bond Gateway is [Apache 2.0 licensed](../../..//LICENSE).
