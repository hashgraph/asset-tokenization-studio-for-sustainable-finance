// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class RoleNotFoundError extends EntityNotFoundError {
  static hexError(hex: string): RoleNotFoundError {
    return new RoleNotFoundError(`Role with hex ${hex} not found.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
