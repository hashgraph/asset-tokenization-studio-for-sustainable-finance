// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CheckPrimaryMarketExistsDomainService } from "@domain/primarymarket/services/CheckPrimaryMarketExistsDomainService"
import type { RoleRepository } from "@domain/role/repositories/RoleRepository"
import type { UserRepository } from "@domain/user/repositories/UserRepository"
import type { UserMarketRoleRepository } from "../repositories/UserMarketRepository"
import { RenounceUserMarketRoleDomainServiceRequest } from "./model/RenounceUserMarketRoleDomainServiceRequest"
import { UserMarketRoleNotFoundError } from "../errors/UserMarketRoleNotFoundError"

@Singleton()
export class RenounceUserMarketRoleDomainService {
  constructor(
    @Inject() private readonly roleRepository: RoleRepository,
    @Inject() private readonly userRepository: UserRepository,
    @Inject() private readonly userMarketRoleRepository: UserMarketRoleRepository,
    private readonly checkPrimaryMarketExistsDomainService: CheckPrimaryMarketExistsDomainService,
  ) {}

  async execute(renounceUserMarketRoleDomainServiceRequest: RenounceUserMarketRoleDomainServiceRequest): Promise<void> {
    const market = await this.checkPrimaryMarketExistsDomainService.execute(
      renounceUserMarketRoleDomainServiceRequest.marketContractId,
    )

    const role = await this.roleRepository.findByHex(renounceUserMarketRoleDomainServiceRequest.roleHex)
    if (!role) {
      throw UserMarketRoleNotFoundError.roleNotFound(
        renounceUserMarketRoleDomainServiceRequest.accountId,
        renounceUserMarketRoleDomainServiceRequest.roleHex,
        renounceUserMarketRoleDomainServiceRequest.marketContractId,
      )
    }

    const user = await this.userRepository.findByAccountId(renounceUserMarketRoleDomainServiceRequest.accountId)
    if (!user) {
      throw UserMarketRoleNotFoundError.userNotFound(
        renounceUserMarketRoleDomainServiceRequest.accountId,
        renounceUserMarketRoleDomainServiceRequest.roleHex,
        renounceUserMarketRoleDomainServiceRequest.marketContractId,
      )
    }

    const userMarketRole = await this.userMarketRoleRepository.findByUserRoleAndMarket(user.id, role.id, market.id)
    if (!userMarketRole) {
      throw UserMarketRoleNotFoundError.roleNotGranted(
        renounceUserMarketRoleDomainServiceRequest.accountId,
        renounceUserMarketRoleDomainServiceRequest.roleHex,
        renounceUserMarketRoleDomainServiceRequest.marketContractId,
      )
    }

    await this.userMarketRoleRepository.delete(userMarketRole)
  }
}
