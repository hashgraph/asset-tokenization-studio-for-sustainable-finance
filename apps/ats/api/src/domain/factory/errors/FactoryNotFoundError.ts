// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class FactoryNotFoundError extends EntityNotFoundError {
  static factoryIdError(factoryId: string): FactoryNotFoundError {
    return new FactoryNotFoundError(`Factory not found for factory id: ${factoryId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
