// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UserRepository } from "@domain/user/repositories/UserRepository"
import { User } from "@domain/user/model/User"
import { UserPersistence } from "../model/UserPersistence"

@Injectable()
export class UserTypeORMRepository implements UserRepository {
  constructor(
    @InjectRepository(UserPersistence)
    private readonly repository: Repository<UserPersistence>,
  ) {}

  async save(user: User): Promise<User> {
    const saved = await this.repository.save(user as UserPersistence)
    return this.toDomain(saved)
  }

  async findByAccountId(accountId: string): Promise<User | null> {
    const persistence = await this.repository.findOne({
      where: { accountId },
    })

    return persistence ? this.toDomain(persistence) : null
  }

  private toDomain(persistence: UserPersistence): User {
    return { ...persistence } as User
  }
}
