// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class FactoryAlreadyUnpausedError extends DomainError {
  static factoryIdError(factoryId: string): FactoryAlreadyUnpausedError {
    return new FactoryAlreadyUnpausedError(`Factory with id ${factoryId} is already unpaused`)
  }
}
