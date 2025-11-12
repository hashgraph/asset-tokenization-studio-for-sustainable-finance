// SPDX-License-Identifier: Apache-2.0

import { Page } from "@pagination/Page"
import { PageOptions } from "@pagination/PageOptions"
import { UserRole } from "@domain/userrole/model/UserRole"

export interface UserRoleRepository {
  save(userRole: UserRole): Promise<UserRole>

  findAllByUserAccountIdAndContractId(userAccountId: string, contractId: string, options: PageOptions): Promise<Page<UserRole>>
}
