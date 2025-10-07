// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddEnvironmentalAssetCommand } from "./AddEnvironmentalAssetCommand"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { EnvironmentalAssetAddedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetAddedEvent"
import { CheckEnvironmentalAssetNotExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetNotExistsDomainService"

@Singleton()
@Handler(AddEnvironmentalAssetCommand)
export class AddEnvironmentalAssetCommandHandler implements CommandHandler<AddEnvironmentalAssetCommand, void> {
  constructor(
    @Inject("EnvironmentalAssetRepository") private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject("TreasuryRepository") private readonly treasuryRepository: TreasuryRepository,
    @Inject() private readonly eventBus: EventBus,
    private readonly checkEnvironmentalAssetNotExists: CheckEnvironmentalAssetNotExistsDomainService,
  ) {}

  @Validate()
  async execute(command: AddEnvironmentalAssetCommand): Promise<void> {
    const treasury = await this.treasuryRepository.findByContractAddress(command.operator)
    if (!treasury) {
      throw TreasuryNotFoundError.addressesError([command.operator])
    }

    await this.checkEnvironmentalAssetNotExists.execute(command.erc721)

    const environmentalAsset = new EnvironmentalAsset()
    Object.defineProperty(environmentalAsset, "id", {
      value: command.erc721,
      writable: false,
      enumerable: true,
      configurable: false,
    })
    environmentalAsset.treasury = treasury.id

    await this.environmentalAssetRepository.save(environmentalAsset)

    this.eventBus.publish(
      new EnvironmentalAssetAddedEvent(treasury.contractAddress, treasury.bondContractAddress, command.erc721),
    )
  }
}
