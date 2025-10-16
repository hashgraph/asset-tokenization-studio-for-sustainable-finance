// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddEnvironmentalAssetTokenCommand } from "./AddEnvironmentalAssetTokenCommand"
import { AddEnvironmentalAssetTokenDomainService } from "@domain/environmentalasset/services/AddEnvironmentalAssetTokenDomainService"
import { EnvironmentalAssetTokenAddedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetTokenAddedEvent"

@Singleton()
@Handler(AddEnvironmentalAssetTokenCommand)
export class AddEnvironmentalAssetTokenCommandHandler
  implements CommandHandler<AddEnvironmentalAssetTokenCommand, void>
{
  constructor(
    @Inject() private readonly eventBus: EventBus,
    private readonly addEnvironmentalAssetTokenDomainService: AddEnvironmentalAssetTokenDomainService,
  ) {}

  @Validate()
  async execute(command: AddEnvironmentalAssetTokenCommand): Promise<void> {
    const environmentalAssetToken = await this.addEnvironmentalAssetTokenDomainService.execute(
      command.environmentalAssetContractId,
      command.tokenId,
    )

    this.eventBus.publish(
      new EnvironmentalAssetTokenAddedEvent(
        environmentalAssetToken.environmentalAssetId,
        environmentalAssetToken.tokenId,
      ),
    )
  }
}
