// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { AbortError } from "p-retry"
import { RetryOptions } from "./RetryOptions"
import { RetryExecutor } from "./RetryExecutor"
import { RetryExecutorPort } from "./ports/RetryExecutorPort"

@Injectable()
export class RetryService {
  createRetryExecutor(loggerContext: string): RetryExecutorPort {
    return new RetryExecutor(loggerContext)
  }

  async run<T>(fn: () => T | Promise<T>, options: RetryOptions = {}): Promise<T> {
    const retryExecutor = this.createRetryExecutor(RetryService.name)
    return retryExecutor.execute(fn, options)
  }

  static abort(error: Error): AbortError {
    return new AbortError(error)
  }
}
