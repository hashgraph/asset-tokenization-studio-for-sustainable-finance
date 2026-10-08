// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddEnvironmentalAssetTokenCommand } from "./AddEnvironmentalAssetTokenCommand"
import { EnvironmentalAssetTokenAddedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetTokenAddedEvent"
import type { EnvironmentalAssetTokenRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTokenRepository"
import { EnvironmentalAssetToken } from "@domain/environmentalasset/model/EnvironmentalAssetToken"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { CheckEnvironmentalAssetTokenNotExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetTokenNotExistsDomainService"

@Singleton()
@Handler(AddEnvironmentalAssetTokenCommand)
export class AddEnvironmentalAssetTokenCommandHandler
  implements CommandHandler<AddEnvironmentalAssetTokenCommand, void>
{
  constructor(
    @Inject() private readonly eventBus: EventBus,
    @Inject() private readonly environmentalAssetTokenRepository: EnvironmentalAssetTokenRepository,
    private readonly checkEnvironmentalAssetExists: CheckEnvironmentalAssetExistsDomainService,
    private readonly checkEnvironmentalAssetTokenNotExists: CheckEnvironmentalAssetTokenNotExistsDomainService,
  ) {}

  @Validate()
  async execute(command: AddEnvironmentalAssetTokenCommand): Promise<void> {
    const environmentalAsset = await this.checkEnvironmentalAssetExists.executeByContractId(
      command.environmentalAssetContractId,
    )

    await this.checkEnvironmentalAssetTokenNotExists.execute(environmentalAsset.id, command.tokenId)

    const token = new EnvironmentalAssetToken()
    token.environmentalAssetId = environmentalAsset.id
    token.tokenId = command.tokenId

    const environmentalAssetToken = await this.environmentalAssetTokenRepository.save(token)

    this.eventBus.publish(
      new EnvironmentalAssetTokenAddedEvent(
        environmentalAssetToken.environmentalAssetId,
        environmentalAssetToken.tokenId,
      ),
    )
  }
}
