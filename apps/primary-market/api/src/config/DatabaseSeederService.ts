// SPDX-License-Identifier: Apache-2.0

import { Injectable, OnApplicationBootstrap, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { UserRolePersistence } from "@hashgraph/green-bonds-shared-core"

//TODO Replace with real data when SC is deployed
@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name)

  constructor(
    @InjectRepository(PrimaryMarketPersistence)
    private readonly primaryMarketRepository: Repository<PrimaryMarketPersistence>,
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
      await this.seedPrimaryMarket()
      await this.seedDefaultUserRole()

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
        isPaused: false,
      })
      this.logger.log(`Created default PrimaryMarket with contractId: ${contractId}`)
    } else {
      this.logger.log(`PrimaryMarket with contractId ${contractId} already exists`)
    }
  }

  private async seedDefaultUserRole() {
    const userAccountId = "0.0.1234"
    const roleId = "0x0000000000000000000000000000000000000000000000000000000000000001"
    const contractId = "0.0.12345"

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
