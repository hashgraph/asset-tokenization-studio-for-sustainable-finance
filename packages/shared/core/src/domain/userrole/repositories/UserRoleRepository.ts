// SPDX-License-Identifier: Apache-2.0

import { Page } from "@pagination/Page"
import { PageOptions } from "@pagination/PageOptions"
import { UserRole } from "@domain/userrole/model/UserRole"

export interface UserRoleRepository {
  save(userRole: UserRole): Promise<UserRole>

  findAllByUserAccountIdAndContractId(
    userAccountId: string,
    contractId: string,
    options: PageOptions,
  ): Promise<Page<UserRole>>

  findAllByRoleIdAndContractId(userAccountId: string, contractId: string, options: PageOptions): Promise<Page<UserRole>>
  delete(userRole: UserRole): Promise<void>
  findByUserAccountIdRoleIdAndContractId(
    userAccountId: string,
    roleId: string,
    contractId: string,
  ): Promise<UserRole | null>
}
