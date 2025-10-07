// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddEnvironmentalAssetCommand } from "./AddEnvironmentalAssetCommand"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { EnvironmentalAssetAddedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetAddedEvent"
import { AddEnvironmentalAssetDomainService } from "@domain/environmentalasset/services/AddEnvironmentalAssetDomainService"

@Singleton()
@Handler(AddEnvironmentalAssetCommand)
export class AddEnvironmentalAssetCommandHandler implements CommandHandler<AddEnvironmentalAssetCommand, void> {
  constructor(
    @Inject("TreasuryRepository") private readonly treasuryRepository: TreasuryRepository,
    @Inject() private readonly eventBus: EventBus,
    private readonly addEnvironmentalAssetDomainService: AddEnvironmentalAssetDomainService,
  ) {}

  @Validate()
  async execute(command: AddEnvironmentalAssetCommand): Promise<void> {
    const treasury = await this.treasuryRepository.findByContractAddress(command.operator)
    if (!treasury) {
      throw TreasuryNotFoundError.addressesError([command.operator])
    }

    await this.addEnvironmentalAssetDomainService.execute(command.operator, command.erc721)

    this.eventBus.publish(
      new EnvironmentalAssetAddedEvent(treasury.contractAddress, treasury.bondContractAddress, command.erc721),
    )
  }
}
