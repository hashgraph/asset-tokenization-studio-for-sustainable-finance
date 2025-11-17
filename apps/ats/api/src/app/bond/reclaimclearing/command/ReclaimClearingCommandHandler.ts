// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { ReclaimClearingCommand } from "./ReclaimClearingCommand"
import { ClearingBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/ClearingBondHolderBalanceDomainService"
import { ClearingReclaimedEvent } from "@domain/bond/clearing/event/ClearingReclaimedEvent"
import { UnsupportedClearingOperationTypeError } from "@domain/bond/clearing/errors/UnsupportedClearingOperationTypeError"
import { ClearingOperationType } from "@domain/bond/clearing/model/ClearingOperationType"
import { UpdateClearingHoldStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingHoldStatusDomainService"
import { UpdateClearingRedeemStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingRedeemStatusDomainService"
import { UpdateClearingStatusDomainServiceRequest } from "@domain/bond/clearing/service/model/UpdateClearingStatusDomainServiceRequest"
import { ClearingStatus } from "@domain/bond/clearing/model/ClearingStatus"

@Singleton()
@Handler(ReclaimClearingCommand)
export class ReclaimClearingCommandHandler implements CommandHandler<ReclaimClearingCommand, void> {
  constructor(
    private readonly updateClearingHoldStatusDomainService: UpdateClearingHoldStatusDomainService,
    private readonly updateClearingRedeemStatusDomainService: UpdateClearingRedeemStatusDomainService,
    private readonly clearingBondHolderBalanceDomainService: ClearingBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: ReclaimClearingCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
      const deletedClearing = await this.updateClearingStatusByType(command)

      await this.clearingBondHolderBalanceDomainService.execute(
        deletedClearing.bondContractId,
        deletedClearing.holderAccountId,
        deletedClearing.partition,
        deletedClearing.amount,
        "CLEARING_UNLOCK",
      )

      this.eventBus.publish(new ClearingReclaimedEvent(deletedClearing))
    })
  }

  private async updateClearingStatusByType(command: ReclaimClearingCommand) {
    const request = new UpdateClearingStatusDomainServiceRequest()
    request.bondContractId = command.bondContractId
    request.holderAccountId = command.holderAccountId
    request.clearingId = command.clearingId
    request.newStatus = ClearingStatus.RECLAIMED

    switch (command.clearingOperationType) {
      case ClearingOperationType.HOLD:
        return await this.updateClearingHoldStatusDomainService.execute(request)
      case ClearingOperationType.TRANSFER:
        // TODO: Uncomment when DeleteClearingTransferDomainService is implemented
        throw UnsupportedClearingOperationTypeError.forType(command.clearingOperationType)
      case ClearingOperationType.REDEEM:
        return await this.updateClearingRedeemStatusDomainService.execute(request)
      default:
        throw UnsupportedClearingOperationTypeError.forType(command.clearingOperationType)
    }
  }
}
