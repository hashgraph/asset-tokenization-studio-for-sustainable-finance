// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { UserRoleRepository } from "@hashgraph/green-bonds-shared-core/dist/domain/userrole/repositories/UserRoleRepository"
import type { UserRole } from "@hashgraph/green-bonds-shared-core/dist/domain/userrole/model/UserRole"

@Singleton()
export class CheckUserRoleExistsDomainService {
  constructor(@Inject() private readonly userRoleRepository: UserRoleRepository) {}

  async execute(userAccountId: string, roleId: string, contractId: string): Promise<UserRole | null> {
    return await this.userRoleRepository.findByUserAccountIdRoleIdAndContractId(userAccountId, roleId, contractId)
  }
}
