// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@decorators/Singleton"
import { UserRoleRepository } from "@domain/userrole/repositories/UserRoleRepository"
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
}
