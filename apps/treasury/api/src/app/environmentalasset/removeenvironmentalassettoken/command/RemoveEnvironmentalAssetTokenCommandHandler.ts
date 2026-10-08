// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { RemoveEnvironmentalAssetTokenCommand } from "./RemoveEnvironmentalAssetTokenCommand"
import { EnvironmentalAssetTokenRemovedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetTokenRemovedEvent"
import type { EnvironmentalAssetTokenRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTokenRepository"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { CheckEnvironmentalAssetTokenExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetTokenExistsDomainService"

@Singleton()
@Handler(RemoveEnvironmentalAssetTokenCommand)
export class RemoveEnvironmentalAssetTokenCommandHandler
  implements CommandHandler<RemoveEnvironmentalAssetTokenCommand, void>
{
  constructor(
    @Inject() private readonly eventBus: EventBus,
    @Inject() private readonly environmentalAssetTokenRepository: EnvironmentalAssetTokenRepository,
    private readonly checkEnvironmentalAssetExists: CheckEnvironmentalAssetExistsDomainService,
    private readonly checkEnvironmentalAssetTokenExists: CheckEnvironmentalAssetTokenExistsDomainService,
  ) {}

  @Validate()
  async execute(command: RemoveEnvironmentalAssetTokenCommand): Promise<void> {
    const environmentalAsset = await this.checkEnvironmentalAssetExists.executeByContractId(
      command.environmentalAssetContractId,
    )

    const existingEnvironmentalAssetToken = await this.checkEnvironmentalAssetTokenExists.execute(
      environmentalAsset.id,
      command.tokenId,
    )

    await this.environmentalAssetTokenRepository.delete(existingEnvironmentalAssetToken)

    this.eventBus.publish(
      new EnvironmentalAssetTokenRemovedEvent(
        existingEnvironmentalAssetToken.environmentalAssetId,
        existingEnvironmentalAssetToken.tokenId,
      ),
    )
  }
}
