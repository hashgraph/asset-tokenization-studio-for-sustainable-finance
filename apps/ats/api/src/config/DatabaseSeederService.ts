// SPDX-License-Identifier: Apache-2.0

import { Injectable, OnApplicationBootstrap, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { FactoryPersistence } from "@port/factory/persistence/model/FactoryPersistence"
import { ConverterUtils, UserRolePersistence } from "@hashgraph/green-bonds-shared-core"
import { ConfigService } from "@nestjs/config"

//TODO Replace with real data when SC is deployed
@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name)

  constructor(
    @InjectRepository(FactoryPersistence)
    private readonly factoryRepository: Repository<FactoryPersistence>,
    @InjectRepository(UserRolePersistence)
    private readonly userRoleRepository: Repository<UserRolePersistence>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV === "test") {
      this.logger.log("Skipping database seeding in test environment")
      return
    }

    this.logger.log("Starting database seeding...")

    try {
      await this.seedFactory()
      this.seedDefaultUserRole()

      this.logger.log("Database seeding completed successfully")
    } catch (error) {
      this.logger.error("Database seeding failed", error)
    }
  }

  private async seedFactory() {
    const blockchainListenerContracts = this.configService.get<string>("BLOCKCHAIN_LISTENER_CONTRACTS") ?? ""

    const atsFactoryEvmAddress = blockchainListenerContracts.split(/[;,]/)[0].trim()

    if (!atsFactoryEvmAddress) {
      this.logger.warn("BLOCKCHAIN_LISTENER_CONTRACTS not configured, skipping ATS Factory seeding")
      return
    }
    const contractId = await ConverterUtils.getHederaAddressFromEvm(atsFactoryEvmAddress)
    const existing = await this.factoryRepository.findOne({
      where: { contractId: contractId },
    })

    if (!existing) {
      await this.factoryRepository.save({
        contractId: contractId,
        isPaused: false,
      })
      this.logger.log(`Created default Factory with factoryId: ${contractId}`)
    } else {
      this.logger.log(`Factory with factoryId ${contractId} already exists`)
    }
  }

  private seedDefaultUserRole() {
    return // Add user role seeding logic here if needed (in case you know what roles the factory already has)
  }
}
