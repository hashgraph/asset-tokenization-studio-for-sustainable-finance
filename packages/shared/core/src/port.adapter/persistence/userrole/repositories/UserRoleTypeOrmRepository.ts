// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@decorators/Singleton"
import { UserRoleRepository } from "@domain/userrole/repositories/UserRoleRepository"
import { Page } from "@pagination/Page"
import { PageOptions } from "@pagination/PageOptions"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UserRolePersistence } from "../model/UserRolePersistence"
import { UserRole } from "@domain/userrole/model/UserRole"

@Singleton()
export class UserRoleTypeOrmRepository implements UserRoleRepository {
  constructor(
    @InjectRepository(UserRolePersistence)
    private readonly userRoleRepository: Repository<UserRolePersistence>,
  ) {}

  async save(userRole: UserRole): Promise<UserRole> {
    return await this.userRoleRepository.save(userRole as UserRolePersistence)
  }

  async findAllByUserAccountIdAndContractId(userAccountId: string, contractId: string, options: PageOptions): Promise<Page<UserRole>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"

    const whereCondition: any = { userAccountId }
    whereCondition.contractId = contractId

    const [persistences, total] = await this.userRoleRepository.findAndCount({
      where: whereCondition,
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => p as UserRole)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }
}
