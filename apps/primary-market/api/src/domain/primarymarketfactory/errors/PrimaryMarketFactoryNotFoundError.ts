// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class PrimaryMarketFactoryNotFoundError extends EntityNotFoundError {
  static factoryIdError(factoryId: string): PrimaryMarketFactoryNotFoundError {
    return new PrimaryMarketFactoryNotFoundError(`Primary market factory not found for factory id: ${factoryId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
