// SPDX-License-Identifier: Apache-2.0

import { validateSync } from "class-validator"
import { plainToInstance } from "class-transformer"
import { ConstraintsValidationError } from "../errors/ConstraintsValidationError"
import "reflect-metadata"

export function Validate() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    const paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyKey)

    descriptor.value = function (...args: any[]) {
      const errors = validateSync(plainToInstance(paramTypes[0], args[0]), {
        forbidUnknownValues: false,
      })
      if (errors.length) {
        throw new ConstraintsValidationError(errors.flatMap((error) => Object.values(error.constraints)))
      }
      return originalMethod.apply(this, args)
    }
  }
}
