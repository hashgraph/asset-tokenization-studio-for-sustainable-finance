// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class PrimaryMarketFactoryAlreadyUnpausedError extends DomainError {
  static factoryIdError(factoryId: string): PrimaryMarketFactoryAlreadyUnpausedError {
    return new PrimaryMarketFactoryAlreadyUnpausedError(
      `Primary market factory with id ${factoryId} is already unpaused`,
    )
  }
}
