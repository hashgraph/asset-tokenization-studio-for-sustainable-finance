// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { ApproveClearingCommand } from "./ApproveClearingCommand"
import { UpdateClearingHoldStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingHoldStatusDomainService"
import { UpdateClearingStatusDomainServiceRequest } from "@domain/bond/clearing/service/model/UpdateClearingStatusDomainServiceRequest"
import { ClearingStatus } from "@domain/bond/clearing/model/ClearingHold"
import { ClearingBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/ClearingBondHolderBalanceDomainService"
import { ClearingApprovedEvent } from "@domain/bond/clearing/event/ClearingApprovedEvent"
import { UnsupportedClearingOperationTypeError } from "@domain/bond/clearing/errors/UnsupportedClearingOperationTypeError"
import { ClearingOperationType } from "@domain/bond/model/ClearingOperationType"

@Singleton()
@Handler(ApproveClearingCommand)
export class ApproveClearingCommandHandler implements CommandHandler<ApproveClearingCommand, void> {
  constructor(
    private readonly updateClearingHoldStatusDomainService: UpdateClearingHoldStatusDomainService,
    private readonly clearingBondHolderBalanceDomainService: ClearingBondHolderBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: ApproveClearingCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
      const approvedClearing = await this.updateClearingStatusByType(command)

      await this.clearingBondHolderBalanceDomainService.execute(
        approvedClearing.bondContractId,
        approvedClearing.holderAccountId,
        approvedClearing.partition,
        approvedClearing.amount,
        "CLEARING_EXECUTE",
      )

      this.eventBus.publish(new ClearingApprovedEvent(approvedClearing))
    })
  }

  private async updateClearingStatusByType(command: ApproveClearingCommand) {
    const request = new UpdateClearingStatusDomainServiceRequest()
    request.bondContractId = command.bondContractId
    request.holderAccountId = command.holderAccountId
    request.clearingId = command.clearingId
    request.newStatus = ClearingStatus.APPROVED

    switch (command.clearingOperationType) {
      case ClearingOperationType.HOLD:
        return await this.updateClearingHoldStatusDomainService.execute(request)
      case ClearingOperationType.TRANSFER:
      // TODO: Uncomment when UpdateClearingTransferStatusDomainService is implemented
      case ClearingOperationType.REDEEM:
      // TODO: Uncomment when UpdateClearingRedeemStatusDomainService is implemented

      default:
        throw UnsupportedClearingOperationTypeError.forType(command.clearingOperationType)
    }
  }
}
