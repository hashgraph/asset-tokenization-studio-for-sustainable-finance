// SPDX-License-Identifier: Apache-2.0

import { RetryOptions } from "../retry/RetryOptions"
import { RetryPRetryAdapter } from "../retry/RetryPRetryAdapter"

export function Retryable(options: RetryOptions = {}) {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    if (typeof originalMethod !== "function") {
      throw new Error(`@Retryable can only be applied to methods, but ${String(propertyKey)} is not a function`)
    }

    descriptor.value = async function (...args: any[]) {
      const methodName = `${target.constructor.name}.${String(propertyKey)}`
      const retryService = new RetryPRetryAdapter()

      return retryService.execute(() => originalMethod.apply(this, args), options, methodName)
    }

    Object.defineProperty(descriptor.value, "name", {
      value: originalMethod.name,
      configurable: true,
    })

    return descriptor
  }
}
