// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { RoleRepository } from "@domain/role/repositories/RoleRepository"
import { Role } from "@domain/role/model/Role"
import { RolePersistence } from "../model/RolePersistence"

@Injectable()
export class RoleTypeORMRepository implements RoleRepository {
  constructor(
    @InjectRepository(RolePersistence)
    private readonly repository: Repository<RolePersistence>,
  ) {}

  async save(role: Role): Promise<Role> {
    const saved = await this.repository.save(role as RolePersistence)
    return this.toDomain(saved)
  }

  async findByHex(hex: string): Promise<Role | null> {
    const persistence = await this.repository.findOne({
      where: { hex },
    })

    return persistence ? this.toDomain(persistence) : null
  }

  private toDomain(persistence: RolePersistence): Role {
    return { ...persistence } as Role
  }
}
