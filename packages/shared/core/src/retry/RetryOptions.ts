// SPDX-License-Identifier: Apache-2.0

import { ValidationError } from "../errors/ValidationError"

export interface RetryOptions {
  retries?: number
  minTimeout?: number
  maxTimeout?: number
  factor?: number
  shouldRetry?: (error: Error) => boolean | Error[]
  shouldNotRetry?: (error: Error) => boolean | Error[]
}

export const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, "shouldRetry" | "shouldNotRetry">> & {
  shouldNotRetry: (error: Error) => boolean
} = {
  retries: parseInt(process.env.RETRY_ATTEMPTS || "3", 10),
  minTimeout: parseInt(process.env.RETRY_MIN_TIMEOUT || "10000", 10),
  maxTimeout: parseInt(process.env.RETRY_MAX_TIMEOUT || "30000", 10),
  factor: parseFloat(process.env.RETRY_FACTOR || "2"),
  shouldNotRetry: (error: Error) => error instanceof ValidationError,
}
