// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { RemoveEnvironmentalAssetCommand } from "./RemoveEnvironmentalAssetCommand"
import { EnvironmentalAssetRemovedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetRemovedEvent"
import { RemoveEnvironmentalAssetDomainService } from "@domain/environmentalasset/services/RemoveEnvironmentalAssetDomainService"

@Singleton()
@Handler(RemoveEnvironmentalAssetCommand)
export class RemoveEnvironmentalAssetCommandHandler implements CommandHandler<RemoveEnvironmentalAssetCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    private readonly removeEnvironmentalAssetDomainService: RemoveEnvironmentalAssetDomainService,
  ) {}

  @Validate()
  async execute(command: RemoveEnvironmentalAssetCommand): Promise<void> {
    const result = await this.removeEnvironmentalAssetDomainService.execute(command.operator, command.erc721)

    this.eventBus.publish(
      new EnvironmentalAssetRemovedEvent(
        result.treasury.contractAddress,
        result.treasury.bondContractAddress,
        command.erc721,
        result.environmentalAsset.deletedAt!,
      ),
    )
  }
}
