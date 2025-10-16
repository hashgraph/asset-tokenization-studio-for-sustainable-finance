// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { RemoveEnvironmentalAssetTokenCommand } from "./RemoveEnvironmentalAssetTokenCommand"
import { RemoveEnvironmentalAssetTokenDomainService } from "@domain/environmentalasset/services/RemoveEnvironmentalAssetTokenDomainService"
import { EnvironmentalAssetTokenRemovedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetTokenRemovedEvent"

@Singleton()
@Handler(RemoveEnvironmentalAssetTokenCommand)
export class RemoveEnvironmentalAssetTokenCommandHandler
  implements CommandHandler<RemoveEnvironmentalAssetTokenCommand, void>
{
  constructor(
    @Inject() private readonly eventBus: EventBus,
    private readonly removeEnvironmentalAssetTokenDomainService: RemoveEnvironmentalAssetTokenDomainService,
  ) {}

  @Validate()
  async execute(command: RemoveEnvironmentalAssetTokenCommand): Promise<void> {
    const environmentalAssetToken = await this.removeEnvironmentalAssetTokenDomainService.execute(
      command.environmentalAssetContractId,
      command.tokenId,
    )

    this.eventBus.publish(
      new EnvironmentalAssetTokenRemovedEvent(
        environmentalAssetToken.environmentalAssetId,
        environmentalAssetToken.tokenId,
      ),
    )
  }
}
