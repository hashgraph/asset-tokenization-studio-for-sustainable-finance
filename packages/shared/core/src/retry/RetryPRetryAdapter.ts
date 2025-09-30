// SPDX-License-Identifier: Apache-2.0

import pRetry, { AbortError } from "p-retry"
import { Logger } from "../logger/Logger"
import { RetryOptions, DEFAULT_RETRY_OPTIONS } from "./RetryOptions"
import { RetryPort } from "./RetryPort"
import { Singleton } from "../decorators/Singleton"

@Singleton()
export class RetryPRetryAdapter implements RetryPort {
  private readonly logger: Logger

  constructor() {
    this.logger = new Logger(RetryPRetryAdapter.name)
  }

  async execute<T>(fn: () => T | Promise<T>, options: RetryOptions = {}, operationName?: string): Promise<T> {
    const mergedOptions = this.mergeWithDefaults(options)
    const finalOperationName = operationName || fn.name || "anonymous function"

    this.logger.debug(
      `🔄 Starting retry operation for '${finalOperationName}' with options: ${JSON.stringify(mergedOptions)}`,
    )

    try {
      return await pRetry(
        async (attemptNumber) => {
          try {
            const result = await Promise.resolve(fn())

            if (attemptNumber > 1) {
              this.logger.debug(`✅ Operation '${finalOperationName}' succeeded on retry attempt ${attemptNumber}`)
            }
            return result
          } catch (error) {
            if (mergedOptions.shouldNotRetry && mergedOptions.shouldNotRetry(error)) {
              this.logger.debug(
                `❌ Operation '${finalOperationName}' error should not be retried (shouldNotRetry), aborting: ${error.message}`,
              )
              throw new AbortError(error)
            }

            if (mergedOptions.shouldRetry && !mergedOptions.shouldRetry(error)) {
              this.logger.debug(
                `❌ Operation '${finalOperationName}' error should not be retried (shouldRetry), aborting: ${error.message}`,
              )
              throw new AbortError(error)
            }

            throw error
          }
        },
        {
          retries: mergedOptions.retries,
          minTimeout: mergedOptions.minTimeout,
          maxTimeout: mergedOptions.maxTimeout,
          factor: mergedOptions.factor,
          onFailedAttempt: (error) => {
            this.logger.debug(
              `🔄 Operation '${finalOperationName}' retry attempt failed (attempt ${error.attemptNumber}/${error.retriesLeft + error.attemptNumber})`,
            )
          },
        },
      )
    } catch (error) {
      this.logger.warn(`❌ Operation '${finalOperationName}' failed after all retry attempts: ${error.message}`)
      throw error
    }
  }

  private mergeWithDefaults(
    options: RetryOptions,
  ): Required<Omit<RetryOptions, "shouldRetry" | "shouldNotRetry">> &
    Pick<RetryOptions, "shouldRetry" | "shouldNotRetry"> {
    return {
      ...DEFAULT_RETRY_OPTIONS,
      ...options,
      shouldNotRetry: options.shouldNotRetry || DEFAULT_RETRY_OPTIONS.shouldNotRetry,
    }
  }
}
