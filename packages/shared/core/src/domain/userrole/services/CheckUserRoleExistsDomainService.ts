// SPDX-License-Identifier: Apache-2.0

import { Inject } from "@decorators/Inject"
import { Singleton } from "@decorators/Singleton"
import { UserRoleNotFoundError } from "@domain/userrole/errors/UserRoleNotFoundError"
import type { UserRoleRepository } from "@domain/userrole/repositories/UserRoleRepository"
import { UserRole } from "@domain/userrole/model/UserRole"

@Singleton()
export class CheckUserRoleExistsDomainService {
  constructor(@Inject() private readonly userRoleRepository: UserRoleRepository) {}

  async execute(userAccountId: string, roleId: string, contractId: string): Promise<UserRole> {
    const userRole = await this.userRoleRepository.findByUserAccountIdRoleIdAndContractId(
      userAccountId,
      roleId,
      contractId,
    )
    if (!userRole) {
      throw UserRoleNotFoundError.create(userAccountId, roleId, contractId)
    }
    return userRole
  }
}
