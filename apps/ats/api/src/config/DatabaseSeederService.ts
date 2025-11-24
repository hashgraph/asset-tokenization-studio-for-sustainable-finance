// SPDX-License-Identifier: Apache-2.0

import { Injectable, OnApplicationBootstrap, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { FactoryPersistence } from "@port/factory/persistence/model/FactoryPersistence"
import { UserRolePersistence } from "@hashgraph/green-bonds-shared-core"

//TODO Replace with real data when SC is deployed
@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name)

  constructor(
    @InjectRepository(FactoryPersistence)
    private readonly factoryRepository: Repository<FactoryPersistence>,
    @InjectRepository(UserRolePersistence)
    private readonly userRoleRepository: Repository<UserRolePersistence>,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV === "test") {
      this.logger.log("Skipping database seeding in test environment")
      return
    }

    this.logger.log("Starting database seeding...")

    try {
      await this.seedFactory()
      await this.seedDefaultUserRole()

      this.logger.log("Database seeding completed successfully")
    } catch (error) {
      this.logger.error("Database seeding failed", error)
    }
  }

  private async seedFactory() {
    const factoryId = "0.0.7247643"
    const existing = await this.factoryRepository.findOne({
      where: { contractId: factoryId },
    })

    if (!existing) {
      await this.factoryRepository.save({
        contractId: factoryId,
        isPaused: false,
      })
      this.logger.log(`Created default Factory with factoryId: ${factoryId}`)
    } else {
      this.logger.log(`Factory with factoryId ${factoryId} already exists`)
    }
  }

  private async seedDefaultUserRole() {
    const userAccountId = "0.0.1234"
    const roleId = "0x1e30887951e961109b31c3e05261cd69e3d6381327ba40ce9968bbadbebce283" // DEPLOYER_ROLE
    const contractId = "0.0.7247643"

    const existing = await this.userRoleRepository.findOne({
      where: {
        userAccountId,
        roleId,
        contractId,
      },
    })

    if (!existing) {
      await this.userRoleRepository.save({
        userAccountId,
        roleId,
        contractId,
      })
      this.logger.log(
        `Created default UserRole for user ${userAccountId} with role ${roleId} in contract ${contractId}`,
      )
    } else {
      this.logger.log(`UserRole for user ${userAccountId} with role ${roleId} in contract ${contractId} already exists`)
    }
  }
}
