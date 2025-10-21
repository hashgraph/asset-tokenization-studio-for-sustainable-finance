// SPDX-License-Identifier: Apache-2.0

import { Role } from "../model/Role"

export interface RoleRepository {
  save(role: Role): Promise<Role>
  findByHex(role: string): Promise<Role | null>
}
