// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { DeleteClearingHoldDomainService } from "@domain/bond/clearing/service/DeleteClearingHoldDomainService"
import { DeleteClearingDomainServiceRequest } from "@domain/bond/clearing/service/model/DeleteClearingDomainServiceRequest"
import { ClearingBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/ClearingBondHolderBalanceDomainService"
import { ClearingCanceledEvent } from "@domain/bond/clearing/event/ClearingCanceledEvent"
import { UnsupportedClearingOperationTypeError } from "@domain/bond/clearing/errors/UnsupportedClearingOperationTypeError"
import { CancelClearingCommand } from "@app/bond/cancelclearing/command/CancelClearingCommand"
import { ClearingOperationType } from "@domain/bond/clearing/model/ClearingOperationType"

@Singleton()
@Handler(CancelClearingCommand)
export class CancelClearingCommandHandler implements CommandHandler<CancelClearingCommand, void> {
  constructor(
    private readonly deleteClearingHoldDomainService: DeleteClearingHoldDomainService,
    private readonly clearingBondHolderBalanceDomainService: ClearingBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CancelClearingCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
      const deletedClearing = await this.deleteClearingByType(command)

      await this.clearingBondHolderBalanceDomainService.execute(
        deletedClearing.bondContractId,
        deletedClearing.holderAccountId,
        deletedClearing.partition,
        deletedClearing.amount,
        "CLEARING_UNLOCK",
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
        // TODO: Uncomment when DeleteClearingTransferDomainService is implemented
        throw UnsupportedClearingOperationTypeError.forType(command.clearingOperationType)
      case ClearingOperationType.REDEEM:
        // TODO: Uncomment when DeleteClearingRedeemDomainService is implemented
        throw UnsupportedClearingOperationTypeError.forType(command.clearingOperationType)
      default:
        throw UnsupportedClearingOperationTypeError.forType(command.clearingOperationType)
    }
  }
}
