// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class DistributionNotFoundError extends EntityNotFoundError {
  private constructor(message: string) {
    super(message)
  }

  static idError(id: number): DistributionNotFoundError {
    return new DistributionNotFoundError(`Distribution with id ${id} not found`)
  }
}
