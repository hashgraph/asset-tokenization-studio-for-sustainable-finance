// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddEnvironmentalAssetTransferCommand } from "@app/environmentalasset/addenvironmentalassettransfer/command/AddEnvironmentalAssetTransferCommand"
import type { EnvironmentalAssetTransferRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetTransferRepository"
import { EnvironmentalAssetTransfer } from "@domain/environmentalasset/model/EnvironmentalAssetTransfer"
import { EnvironmentalAssetTransferAddedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetTransferAddedEvent"
import { CheckEnvironmentalAssetExistsDomainService } from "@domain/environmentalasset/services/CheckEnvironmentalAssetExistsDomainService"
import { TransferType } from "@domain/shared/model/TransferType"

@Singleton()
@Handler(AddEnvironmentalAssetTransferCommand)
export class AddEnvironmentalAssetTransferCommandHandler
  implements CommandHandler<AddEnvironmentalAssetTransferCommand, void>
{
  constructor(
    private readonly checkEnvironmentalAssetExistsDomainService: CheckEnvironmentalAssetExistsDomainService,
    @Inject() private readonly environmentalAssetTransferRepository: EnvironmentalAssetTransferRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: AddEnvironmentalAssetTransferCommand): Promise<void> {
    const environmentalAsset = await this.checkEnvironmentalAssetExistsDomainService.executeByContractId(
      command.environmentalAssetContractId,
    )
    await this.environmentalAssetTransferRepository.save({
      accountId: command.accountId,
      environmentalAssetId: environmentalAsset.id,
      tokenId: command.tokenId,
      type: <TransferType>command.type,
    } as EnvironmentalAssetTransfer)

    this.eventBus.publish(
      new EnvironmentalAssetTransferAddedEvent(environmentalAsset.id, command.tokenId, command.accountId, command.type),
    )
  }
}
