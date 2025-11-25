// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class PrimaryMarketFactoryAlreadyPausedError extends DomainError {
  static factoryIdError(factoryId: string): PrimaryMarketFactoryAlreadyPausedError {
    return new PrimaryMarketFactoryAlreadyPausedError(`Primary market factory with id ${factoryId} is already paused`)
  }
}
