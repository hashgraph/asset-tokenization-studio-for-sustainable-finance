// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { SyncEnvironmentalAssetTokenAppServiceRequest } from "@app/environmentalasset/syncenvironmentalassettoken/service/model/SyncEnvironmentalAssetTokenAppServiceRequest"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { AddEnvironmentalAssetTokenCommand } from "@app/environmentalasset/addenvironmentalassettoken/command/AddEnvironmentalAssetTokenCommand"
import { RemoveEnvironmentalAssetTokenCommand } from "@app/environmentalasset/removeenvironmentalassettoken/command/RemoveEnvironmentalAssetTokenCommand"

@Singleton()
export class SyncEnvironmentalAssetTokenAppService {
  constructor(
    @Inject() private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject() private readonly treasuryRepository: TreasuryRepository,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Validate()
  async execute(request: SyncEnvironmentalAssetTokenAppServiceRequest): Promise<void> {
    if (request.tokenId === undefined) {
      return
    }

    // Define scenarios for OUTFLOW and INFLOW
    const scenarios = [
      {
        accountId: request.fromAccountId,
        command: (EnvironmentalAssetContractId: string, tokenId: number) =>
          new RemoveEnvironmentalAssetTokenCommand(EnvironmentalAssetContractId, tokenId),
      },
      {
        accountId: request.toAccountId,
        command: (EnvironmentalAssetContractId: string, tokenId: number) =>
          new AddEnvironmentalAssetTokenCommand(EnvironmentalAssetContractId, tokenId),
      },
    ]

    for (const scenario of scenarios) {
      const treasury = await this.treasuryRepository.findByContractId(scenario.accountId)
      if (!treasury) continue

      const environmentalAsset = await this.environmentalAssetRepository.findByContractIdAndTreasuryId(
        request.environmentalAssetContractId,
        treasury.id,
      )
      if (!environmentalAsset) continue

      await this.commandBus.execute(scenario.command(request.environmentalAssetContractId, request.tokenId))
      return
    }
  }
}
