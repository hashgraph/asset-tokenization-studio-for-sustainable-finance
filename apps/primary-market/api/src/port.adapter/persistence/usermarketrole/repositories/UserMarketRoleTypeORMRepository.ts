// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UserMarketRoleRepository } from "@domain/usermarketrole/repositories/UserMarketRepository"
import { UserMarketRole } from "@domain/usermarketrole/model/UserMarketRole"
import { UserMarketRolePersistence } from "../model/UserMarketRolePersistence"
import { plainToInstance } from "class-transformer"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class UserMarketRoleTypeORMRepository implements UserMarketRoleRepository {
  constructor(
    @InjectRepository(UserMarketRolePersistence)
    private readonly repository: Repository<UserMarketRolePersistence>,
  ) {}

  async save(userMarketRole: UserMarketRole): Promise<UserMarketRole> {
    const saved = await this.repository.save(userMarketRole as unknown as UserMarketRolePersistence)
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

  async findByMarketIdAndRoleId(
    marketId: string,
    roleId: string,
    pageOptions: PageOptions,
  ): Promise<Page<UserMarketRole>> {
    const orderDirection = pageOptions.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.repository.findAndCount({
      where: {
        market: { id: marketId },
        role: { id: roleId },
      },
      relations: ["user", "role", "market"],
      order: { [pageOptions.order.orderBy]: orderDirection },
      skip: (pageOptions.page - 1) * pageOptions.limit,
      take: pageOptions.limit,
    })

    const items = persistences.map((p) => p as unknown as UserMarketRole)

    return {
      items,
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }

  private toDomain(persistence: UserMarketRolePersistence): UserMarketRole {
    return plainToInstance(UserMarketRole, persistence)
  }
}
