// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UserMarketRoleRepository } from "@domain/usermarketrole/repositories/UserMarketRepository"
import { UserMarketRole } from "@domain/usermarketrole/model/UserMarketRole"
import { UserMarketRolePersistence } from "../model/UserMarketRolePersistence"

@Injectable()
export class UserMarketRoleTypeORMRepository implements UserMarketRoleRepository {
  constructor(
    @InjectRepository(UserMarketRolePersistence)
    private readonly repository: Repository<UserMarketRolePersistence>,
  ) {}

  async save(userMarketRole: UserMarketRole): Promise<UserMarketRole> {
    const saved = await this.repository.save(userMarketRole as UserMarketRolePersistence)
    return this.toDomain(saved)
  }

  async findByUserRoleAndMarket(userId: string, roleId: string, marketId: string): Promise<UserMarketRole | null> {
    const persistence = await this.repository.findOne({
      where: {
        user: { id: userId },
        role: { id: roleId },
        market: { id: marketId },
      },
    })

    return persistence ? this.toDomain(persistence) : null
  }

  private toDomain(persistence: UserMarketRolePersistence): UserMarketRole {
    return { ...persistence } as UserMarketRole
  }
}
