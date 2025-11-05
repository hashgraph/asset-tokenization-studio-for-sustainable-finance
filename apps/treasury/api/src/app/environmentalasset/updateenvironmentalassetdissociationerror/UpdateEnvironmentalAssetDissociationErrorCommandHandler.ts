// SPDX-License-Identifier: Apache-2.0

import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { UpdateEnvironmentalAssetDissociationErrorCommand } from "@app/environmentalasset/updateenvironmentalassetdissociationerror/UpdateEnvironmentalAssetDissociationErrorCommand"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { EnvironmentalAssetDissociationErrorUpdatedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetDissociationErrorUpdatedEvent"

@Singleton()
@Handler(UpdateEnvironmentalAssetDissociationErrorCommand)
export class UpdateEnvironmentalAssetDissociationErrorCommandHandler
  implements CommandHandler<UpdateEnvironmentalAssetDissociationErrorCommand, void>
{
  constructor(
    private readonly checkEnvironmentalAssetExistsDomainService: CheckEnvironmentalAssetExistsDomainService,
    @Inject() private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: UpdateEnvironmentalAssetDissociationErrorCommand): Promise<void> {
    const environmentalAsset = await this.checkEnvironmentalAssetExistsDomainService.executeByTreasuryContractId(
      command.environmentalAssetContractId,
      command.treasuryContractId,
    )
    environmentalAsset.clearDissociationError()

    await this.environmentalAssetRepository.save(environmentalAsset)
    this.eventBus.publish(
      new EnvironmentalAssetDissociationErrorUpdatedEvent(environmentalAsset.treasuryId, environmentalAsset.id),
    )
  }
}
