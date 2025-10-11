// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddEnvironmentalAssetCommand } from "./AddEnvironmentalAssetCommand"
import { EnvironmentalAssetAddedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetAddedEvent"
import { AddEnvironmentalAssetDomainService } from "@domain/environmentalasset/services/AddEnvironmentalAssetDomainService"

@Singleton()
@Handler(AddEnvironmentalAssetCommand)
export class AddEnvironmentalAssetCommandHandler implements CommandHandler<AddEnvironmentalAssetCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    private readonly addEnvironmentalAssetDomainService: AddEnvironmentalAssetDomainService,
  ) {}

  @Validate()
  async execute(command: AddEnvironmentalAssetCommand): Promise<void> {
    const result = await this.addEnvironmentalAssetDomainService.execute(
      command.treasuryContractId,
      command.assetContractId,
    )

    this.eventBus.publish(
      new EnvironmentalAssetAddedEvent(
        result.treasury.contractId,
        result.treasury.bondContractId,
        command.assetContractId,
      ),
    )
  }
}
