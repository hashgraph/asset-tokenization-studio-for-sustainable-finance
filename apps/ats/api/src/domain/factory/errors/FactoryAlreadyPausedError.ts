// SPDX-License-Identifier: Apache-2.0

import { DomainError } from "@hashgraph/green-bonds-shared-core"

export class FactoryAlreadyPausedError extends DomainError {
  static factoryIdError(factoryId: string): FactoryAlreadyPausedError {
    return new FactoryAlreadyPausedError(`Factory with id ${factoryId} is already paused`)
  }
}
