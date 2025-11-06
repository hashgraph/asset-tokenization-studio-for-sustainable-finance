// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { RoleRepository } from "../repositories/RoleRepository"
import { Role } from "../model/Role"
import { RoleNotFoundError } from "../errors/RoleNotFoundError"

@Singleton()
export class CheckRoleExistsDomainService {
  constructor(@Inject() private readonly roleRepository: RoleRepository) {}

  async execute(roleHex: string): Promise<Role> {
    const role = await this.roleRepository.findByHex(roleHex)
    if (!role) {
      throw RoleNotFoundError.hexError(roleHex)
    }
    return role
  }
}
