// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import type { RoleRepository } from "@domain/role/repositories/RoleRepository"
import type { UserRepository } from "@domain/user/repositories/UserRepository"
import type { UserMarketRoleRepository } from "../repositories/UserMarketRepository"
import { GrantUserMarketRoleDomainServiceRequest } from "./model/GrantUserMarketRoleDomainServiceRequest"
import { UserMarketRole } from "../model/UserMarketRole"
import { Role } from "@domain/role/model/Role"
import { User } from "@domain/user/model/User"
import { UserMarketRoleFoundError } from "../errors/UserMarketRoleFoundError"

@Singleton()
export class GrantUserMarketRoleDomainService {
  constructor(
    @Inject() private readonly roleRepository: RoleRepository,
    @Inject() private readonly userRepository: UserRepository,
    @Inject() private readonly userMarketRoleRepository: UserMarketRoleRepository,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
  ) {}

  async execute(
    grantUserMarketRoleDomainServiceRequest: GrantUserMarketRoleDomainServiceRequest,
  ): Promise<UserMarketRole> {
    const market = await this.checkPrimaryMarketExistsDomainService.execute(
      grantUserMarketRoleDomainServiceRequest.marketId,
    )
    market.checkActive()

    const role = await this.getOrCreateRole(grantUserMarketRoleDomainServiceRequest.roleHex)
    const user = await this.getOrCreateUser(grantUserMarketRoleDomainServiceRequest.accountId)

    await this.checkUserMarketRoleNotExists(user.id, role.id, market.id, grantUserMarketRoleDomainServiceRequest)

    const userMarketRole = new UserMarketRole()
    userMarketRole.user = user
    userMarketRole.role = role
    userMarketRole.market = market

    return await this.userMarketRoleRepository.save(userMarketRole)
  }

  private async getOrCreateRole(roleHex: string): Promise<Role> {
    let role = await this.roleRepository.findByHex(roleHex)
    if (!role) {
      role = Object.assign(new Role(), { hex: roleHex })
      role = await this.roleRepository.save(role)
    }
    return role
  }

  private async getOrCreateUser(accountId: string): Promise<User> {
    let user = await this.userRepository.findByAccountId(accountId)
    if (!user) {
      user = Object.assign(new User(), { accountId })
      user = await this.userRepository.save(user)
    }
    return user
  }

  private async checkUserMarketRoleNotExists(
    userId: string,
    roleId: string,
    marketId: string,
    request: GrantUserMarketRoleDomainServiceRequest,
  ): Promise<void> {
    const existing = await this.userMarketRoleRepository.findByUserRoleAndMarket(userId, roleId, marketId)
    if (existing) {
      throw UserMarketRoleFoundError.roleAlreadyGranted(request.accountId, request.roleHex, request.marketId)
    }
  }
}
