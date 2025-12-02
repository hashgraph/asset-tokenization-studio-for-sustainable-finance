// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { ReclaimClearingCommand } from "./ReclaimClearingCommand"
import { UpdateClearingBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/UpdateClearingBondHolderBalanceDomainService"
import { ClearingReclaimedEvent } from "@domain/bond/clearing/event/ClearingReclaimedEvent"
import { UnsupportedClearingOperationTypeError } from "@domain/bond/clearing/errors/UnsupportedClearingOperationTypeError"
import { ClearingOperationType } from "@domain/bond/clearing/model/ClearingOperationType"
import { UpdateClearingHoldStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingHoldStatusDomainService"
import { UpdateClearingRedeemStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingRedeemStatusDomainService"
import { UpdateClearingTransferStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingTransferStatusDomainService"
import { UpdateClearingStatusDomainServiceRequest } from "@domain/bond/clearing/service/model/UpdateClearingStatusDomainServiceRequest"
import { ClearingStatus } from "@domain/bond/clearing/model/ClearingStatus"

@Singleton()
@Handler(ReclaimClearingCommand)
export class ReclaimClearingCommandHandler implements CommandHandler<ReclaimClearingCommand, void> {
  constructor(
    private readonly updateClearingHoldStatusDomainService: UpdateClearingHoldStatusDomainService,
    private readonly updateClearingRedeemStatusDomainService: UpdateClearingRedeemStatusDomainService,
    private readonly updateClearingTransferStatusDomainService: UpdateClearingTransferStatusDomainService,
    private readonly updateClearingBondHolderBalanceDomainService: UpdateClearingBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: ReclaimClearingCommand): Promise<void> {
    await this.transactionManager.execute(async (transactionId) => {
      const deletedClearing = await this.updateClearingStatusByType(command, transactionId)

      await this.updateClearingBondHolderBalanceDomainService.execute(
        deletedClearing.bondContractId,
        deletedClearing.holderAccountId,
        deletedClearing.partition,
        deletedClearing.amount,
        "CLEARING_UNLOCK",
        transactionId,
      )

      this.eventBus.publish(new ClearingReclaimedEvent(deletedClearing))
    })
  }

  private async updateClearingStatusByType(command: ReclaimClearingCommand, transactionId?: string) {
    const request = new UpdateClearingStatusDomainServiceRequest()
    request.bondContractId = command.bondContractId
    request.holderAccountId = command.holderAccountId
    request.clearingId = command.clearingId
    request.newStatus = ClearingStatus.RECLAIMED

    switch (command.clearingOperationType) {
      case ClearingOperationType.HOLD:
        return await this.updateClearingHoldStatusDomainService.execute(request, transactionId)
      case ClearingOperationType.TRANSFER:
        return await this.updateClearingTransferStatusDomainService.execute(request, transactionId)
      case ClearingOperationType.REDEEM:
        return await this.updateClearingRedeemStatusDomainService.execute(request, transactionId)
      default:
        throw UnsupportedClearingOperationTypeError.forType(command.clearingOperationType)
    }
  }
}
