export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class PayloadFormatError extends DomainError {
  readonly code = 'PAYLOAD_FORMAT_ERROR';

  constructor(format: string, message: string, cause?: Error) {
    super(`Invalid ${format} payload format: ${message}`, cause);
  }
}

export class NetworkAdapterError extends DomainError {
  readonly code = 'NETWORK_ADAPTER_ERROR';

  constructor(network: string, message: string, cause?: Error) {
    super(`${network} network adapter error: ${message}`, cause);
  }
}
