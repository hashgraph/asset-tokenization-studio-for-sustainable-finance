// SPDX-License-Identifier: Apache-2.0

import { UserRole } from "@domain/userrole/model/UserRole"

export interface UserRoleRepository {
  save(userRole: UserRole): Promise<UserRole>
}
