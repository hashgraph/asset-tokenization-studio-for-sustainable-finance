// SPDX-License-Identifier: Apache-2.0

import { RetryOptions } from "../retry/RetryOptions"
import { RetryExecutor } from "../retry/RetryExecutor"

export function Retryable(options: RetryOptions = {}) {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    if (typeof originalMethod !== "function") {
      throw new Error(`@Retryable can only be applied to methods, but ${String(propertyKey)} is not a function`)
    }

    descriptor.value = async function (...args: any[]) {
      const methodName = `${target.constructor.name}.${String(propertyKey)}`
      const retryExecutor = new RetryExecutor(target.constructor.name)

      return retryExecutor.execute(() => originalMethod.apply(this, args), options, methodName)
    }

    Object.defineProperty(descriptor.value, "name", {
      value: originalMethod.name,
      configurable: true,
    })

    return descriptor
  }
}
