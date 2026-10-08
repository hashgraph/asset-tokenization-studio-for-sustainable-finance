// SPDX-License-Identifier: Apache-2.0

import { Injectable, OnApplicationBootstrap, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ConverterUtils } from "@hashgraph/green-bonds-shared-core"
import { ConfigService } from "@nestjs/config"
import { PrimaryMarketFactoryPersistence } from "@port/persistence/primarymarketfactory/model/PrimaryMarketFactoryPersistence"

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name)

  constructor(
    @InjectRepository(PrimaryMarketFactoryPersistence)
    private readonly primaryMarketFactoryRepository: Repository<PrimaryMarketFactoryPersistence>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV === "test") {
      this.logger.log("Skipping database seeding in test environment")
      return
    }

    this.logger.log("Starting database seeding...")

    try {
      await this.seedPrimaryMarketFactory()
      this.seedDefaultUserRole()

      this.logger.log("Database seeding completed successfully")
    } catch (error) {
      this.logger.error("Database seeding failed", error)
    }
  }

  private async seedPrimaryMarketFactory() {
    const blockchainListenerContracts = this.configService.get<string>("BLOCKCHAIN_LISTENER_CONTRACTS") ?? ""

    const primaryMarketFactoryEvmAddress = blockchainListenerContracts.split(/[;,]/)[0].trim()

    if (!primaryMarketFactoryEvmAddress) {
      this.logger.warn("BLOCKCHAIN_LISTENER_CONTRACTS not configured, skipping PrimaryMarketFactory seeding")
      return
    }

    const contractId = await ConverterUtils.getHederaAddressFromEvm(primaryMarketFactoryEvmAddress)
    const existing = await this.primaryMarketFactoryRepository.findOne({
      where: { contractId },
    })

    if (!existing) {
      await this.primaryMarketFactoryRepository.save({
        contractId,
        isPaused: false,
      })
      this.logger.log(`Created default PrimaryMarketFactory with contractId: ${contractId}`)
    } else {
      this.logger.log(`PrimaryMarketFactory with contractId ${contractId} already exists`)
    }
  }

  private seedDefaultUserRole() {
    return // Add user role seeding logic here if needed (in case you know what roles the factory already has)
  }
}
