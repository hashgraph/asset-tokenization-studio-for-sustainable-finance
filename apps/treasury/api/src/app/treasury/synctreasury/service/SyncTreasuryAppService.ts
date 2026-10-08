// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { SyncTreasuryAppServiceRequest } from "@app/treasury/synctreasury/service/model/SyncTreasuryAppServiceRequest"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { CreateTreasuryCommand } from "@app/treasury/createtreasury/command/CreateTreasuryCommand"
import { AddPaymentTokenCommand } from "@app/treasury/addpaymenttoken/command/AddPaymentTokenCommand"
import { AddEnvironmentalAssetCommand } from "@app/environmentalasset/addenvironmentalasset/command/AddEnvironmentalAssetCommand"

@Singleton()
export class SyncTreasuryAppService {
  constructor(
    @Inject() private readonly treasuryRepository: TreasuryRepository,
    @Inject() private readonly paymentTokenRepository: PaymentTokenRepository,
    @Inject() private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Validate()
  async execute(request: SyncTreasuryAppServiceRequest): Promise<void> {
    await this.ensureTreasuryExists(request.treasuryContractId, request.bondContractId)
    await this.ensurePaymentTokenExists(request.treasuryContractId, request.paymentToken)
    await this.ensureEnvironmentalAssetsExist(request.treasuryContractId, request.environmentalAssets)
  }

  private async ensureTreasuryExists(treasuryContractId: string, bondContractId: string): Promise<void> {
    const existingTreasury = await this.treasuryRepository.findByContractId(treasuryContractId)

    if (!existingTreasury) {
      await this.commandBus.execute(new CreateTreasuryCommand(treasuryContractId, bondContractId))
    }
  }

  private async ensurePaymentTokenExists(treasuryContractId: string, paymentTokenContractId: string): Promise<void> {
    const paymentTokenExists = await this.paymentTokenRepository.existsByContractIdAndTreasuryContractId(
      paymentTokenContractId,
      treasuryContractId,
      false,
    )

    if (!paymentTokenExists) {
      await this.commandBus.execute(new AddPaymentTokenCommand(treasuryContractId, paymentTokenContractId))
    }
  }

  private async ensureEnvironmentalAssetsExist(
    treasuryContractId: string,
    environmentalAssets: string[],
  ): Promise<void> {
    for (const assetContractId of environmentalAssets) {
      const environmentalAssetTokenExists =
        await this.environmentalAssetRepository.existsByContractIdAndTreasuryContractId(
          assetContractId,
          treasuryContractId,
          false,
        )

      if (!environmentalAssetTokenExists) {
        await this.commandBus.execute(new AddEnvironmentalAssetCommand(treasuryContractId, assetContractId))
      }
    }
  }
}
