// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { RemoveEnvironmentalAssetCommand } from "./RemoveEnvironmentalAssetCommand"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { EnvironmentalAssetRemovedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetRemovedEvent"
import { RemoveEnvironmentalAssetDomainService } from "@domain/environmentalasset/services/RemoveEnvironmentalAssetDomainService"

@Singleton()
@Handler(RemoveEnvironmentalAssetCommand)
export class RemoveEnvironmentalAssetCommandHandler implements CommandHandler<RemoveEnvironmentalAssetCommand, void> {
  constructor(
    @Inject("TreasuryRepository") private readonly treasuryRepository: TreasuryRepository,
    @Inject() private readonly eventBus: EventBus,
    private readonly removeEnvironmentalAssetDomainService: RemoveEnvironmentalAssetDomainService,
  ) {}

  @Validate()
  async execute(command: RemoveEnvironmentalAssetCommand): Promise<void> {
    const treasury = await this.treasuryRepository.findByContractAddress(command.operator)
    if (!treasury) {
      throw TreasuryNotFoundError.addressesError([command.operator])
    }

    const deletedAsset = await this.removeEnvironmentalAssetDomainService.execute(command.operator, command.erc721)

    this.eventBus.publish(
      new EnvironmentalAssetRemovedEvent(
        treasury.contractAddress,
        treasury.bondContractAddress,
        command.erc721,
        deletedAsset.deletedAt!,
      ),
    )
  }
}
