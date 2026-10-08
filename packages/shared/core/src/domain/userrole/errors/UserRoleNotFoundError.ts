// SPDX-License-Identifier: Apache-2.0

import { EntityNotFoundError } from "@errors/EntityNotFoundError"

export class UserRoleNotFoundError extends EntityNotFoundError {
  static create(userAccountId: string, roleId: string, contractId: string): UserRoleNotFoundError {
    return new UserRoleNotFoundError(
      `UserRole not found for userAccountId=${userAccountId}, roleId=${roleId}, contractId=${contractId}.`,
    )
  }

  private constructor(message: string) {
    super(message)
  }
}
