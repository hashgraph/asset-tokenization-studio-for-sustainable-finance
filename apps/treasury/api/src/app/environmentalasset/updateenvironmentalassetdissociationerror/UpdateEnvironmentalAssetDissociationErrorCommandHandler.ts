// SPDX-License-Identifier: Apache-2.0

import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { UpdateEnvironmentalAssetDissociationErrorCommand } from "@app/environmentalasset/updateenvironmentalassetdissociationerror/UpdateEnvironmentalAssetDissociationErrorCommand"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { EnvironmentalAssetDissociationErrorUpdatedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetDissociationErrorUpdatedEvent"

@Singleton()
@Handler(UpdateEnvironmentalAssetDissociationErrorCommand)
export class UpdateEnvironmentalAssetDissociationErrorCommandHandler
  implements CommandHandler<UpdateEnvironmentalAssetDissociationErrorCommand, void>
{
  constructor(
    @Inject() private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject() private readonly eventBus: EventBus,
    @Inject() private readonly transactionManager: TransactionManager,
  ) {}

  @Validate()
  async execute(command: UpdateEnvironmentalAssetDissociationErrorCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
      const tokens = await this.environmentalAssetRepository.findAllRemovedByContractIdAndTreasuryContractId(
        command.environmentalAssetContractId,
        command.treasuryContractId,
      )
      for (const token of tokens) {
        token.clearDissociationError()
        await this.environmentalAssetRepository.save(token)
      }
    })
    this.eventBus.publish(
      new EnvironmentalAssetDissociationErrorUpdatedEvent(
        command.treasuryContractId,
        command.environmentalAssetContractId,
      ),
    )
  }
}
