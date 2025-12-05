// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { DeleteClearingHoldDomainService } from "@domain/clearing/service/DeleteClearingHoldDomainService"
import { DeleteClearingRedeemDomainService } from "@domain/clearing/service/DeleteClearingRedeemDomainService"
import { DeleteClearingTransferDomainService } from "@domain/clearing/service/DeleteClearingTransferDomainService"
import { DeleteClearingDomainServiceRequest } from "@domain/clearing/service/model/DeleteClearingDomainServiceRequest"
import { UpdateClearingBondHolderBalanceDomainService } from "@domain/holderbalance/service/UpdateClearingBondHolderBalanceDomainService"
import { ClearingCanceledEvent } from "@domain/clearing/event/ClearingCanceledEvent"
import { UnsupportedClearingOperationTypeError } from "@domain/clearing/errors/UnsupportedClearingOperationTypeError"
import { CancelClearingCommand } from "@app/clearing/cancelclearing/command/CancelClearingCommand"
import { ClearingOperationType } from "@domain/clearing/model/ClearingOperationType"

@Singleton()
@Handler(CancelClearingCommand)
export class CancelClearingCommandHandler implements CommandHandler<CancelClearingCommand, void> {
  constructor(
    private readonly deleteClearingHoldDomainService: DeleteClearingHoldDomainService,
    private readonly deleteClearingRedeemDomainService: DeleteClearingRedeemDomainService,
    private readonly deleteClearingTransferDomainService: DeleteClearingTransferDomainService,
    private readonly updateClearingBondHolderBalanceDomainService: UpdateClearingBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CancelClearingCommand): Promise<void> {
    await this.transactionManager.execute(async (transactionId) => {
      const deletedClearing = await this.deleteClearingByType(command)

      await this.updateClearingBondHolderBalanceDomainService.execute(
        deletedClearing.bondContractId,
        deletedClearing.holderAccountId,
        deletedClearing.partition,
        deletedClearing.amount,
        "CLEARING_UNLOCK",
        transactionId,
      )

      this.eventBus.publish(new ClearingCanceledEvent(deletedClearing))
    })
  }

  private async deleteClearingByType(command: CancelClearingCommand) {
    const request = new DeleteClearingDomainServiceRequest()
    request.bondContractId = command.bondContractId
    request.holderAccountId = command.holderAccountId
    request.clearingId = command.clearingId

    switch (command.clearingOperationType) {
      case ClearingOperationType.HOLD:
        return await this.deleteClearingHoldDomainService.execute(request)
      case ClearingOperationType.TRANSFER:
        return await this.deleteClearingTransferDomainService.execute(request)
      case ClearingOperationType.REDEEM:
        return await this.deleteClearingRedeemDomainService.execute(request)
      default:
        throw UnsupportedClearingOperationTypeError.forType(command.clearingOperationType)
    }
  }
}
