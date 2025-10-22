// SPDX-License-Identifier: Apache-2.0

import { Injectable, OnApplicationBootstrap, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { UserPersistence } from "@port/persistence/user/model/UserPersistence"
import { RolePersistence } from "@port/persistence/role/model/RolePersistence"
import { UserMarketRolePersistence } from "@port/persistence/usermarketrole/model/UserMarketRolePersistence"

//TODO Replace with real data when SC is deployed
@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name)

  constructor(
    @InjectRepository(PrimaryMarketPersistence)
    private readonly primaryMarketRepository: Repository<PrimaryMarketPersistence>,
    @InjectRepository(UserPersistence)
    private readonly userRepository: Repository<UserPersistence>,
    @InjectRepository(RolePersistence)
    private readonly roleRepository: Repository<RolePersistence>,
    @InjectRepository(UserMarketRolePersistence)
    private readonly userMarketRoleRepository: Repository<UserMarketRolePersistence>,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV === "test") {
      this.logger.log("Skipping database seeding in test environment")
      return
    }

    this.logger.log("Starting database seeding...")

    try {
      await this.seedPrimaryMarket()
      await this.seedDefaultRole()
      await this.seedDefaultUser()
      await this.seedDefaultUserMarketRole()

      this.logger.log("Database seeding completed successfully")
    } catch (error) {
      this.logger.error("Database seeding failed", error)
    }
  }

  private async seedPrimaryMarket() {
    const contractId = "0.0.12345"
    const existing = await this.primaryMarketRepository.findOne({
      where: { contractId },
    })

    if (!existing) {
      await this.primaryMarketRepository.save({
        contractId,
      })
      this.logger.log(`Created default PrimaryMarket with contractId: ${contractId}`)
    } else {
      this.logger.log(`PrimaryMarket with contractId ${contractId} already exists`)
    }
  }

  private async seedDefaultRole() {
    const roleHex = "0x0000000000000000000000000000000000000000000000000000000000000001"
    const existing = await this.roleRepository.findOne({
      where: { hex: roleHex },
    })

    if (!existing) {
      await this.roleRepository.save({
        hex: roleHex,
      })
      this.logger.log(`Created default Role with hex: ${roleHex}`)
    } else {
      this.logger.log(`Role with hex ${roleHex} already exists`)
    }
  }

  private async seedDefaultUser() {
    const accountId = "0.0.1234"
    const existing = await this.userRepository.findOne({
      where: { accountId },
    })

    if (!existing) {
      await this.userRepository.save({
        accountId,
      })
      this.logger.log(`Created default User with accountId: ${accountId}`)
    } else {
      this.logger.log(`User with accountId ${accountId} already exists`)
    }
  }

  private async seedDefaultUserMarketRole() {
    const market = await this.primaryMarketRepository.findOne({
      where: { contractId: "0.0.12345" },
    })
    const role = await this.roleRepository.findOne({
      where: { hex: "0x0000000000000000000000000000000000000000000000000000000000000001" },
    })
    const user = await this.userRepository.findOne({
      where: { accountId: "0.0.1234" },
    })

    if (!market || !role || !user) {
      this.logger.error("Cannot seed UserMarketRole: missing required entities")
      return
    }
    const existing = await this.userMarketRoleRepository.findOne({
      where: {
        user: { id: user.id },
        role: { id: role.id },
        market: { id: market.id },
      },
    })
    if (!existing) {
      await this.userMarketRoleRepository.save({
        user,
        role,
        market,
      })
      this.logger.log(
        `Created default UserMarketRole for user ${user.accountId} with role ${role.hex} in market ${market.contractId}`,
      )
    } else {
      this.logger.log(
        `UserMarketRole for user ${user.accountId} with role ${role.hex} in market ${market.contractId} already exists`,
      )
    }
  }
}
