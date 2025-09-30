// SPDX-License-Identifier: Apache-2.0

import { RetryOptions } from "./RetryOptions"

export interface RetryPort {
  execute<T>(fn: () => T | Promise<T>, options: RetryOptions, operationName?: string): Promise<T>
}
