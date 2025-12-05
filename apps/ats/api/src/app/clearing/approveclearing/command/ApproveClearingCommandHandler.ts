// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { ApproveClearingCommand } from "./ApproveClearingCommand"
import { UpdateClearingHoldStatusDomainService } from "@domain/clearing/service/UpdateClearingHoldStatusDomainService"
import { UpdateClearingRedeemStatusDomainService } from "@domain/clearing/service/UpdateClearingRedeemStatusDomainService"
import { UpdateClearingTransferStatusDomainService } from "@domain/clearing/service/UpdateClearingTransferStatusDomainService"
import { UpdateClearingStatusDomainServiceRequest } from "@domain/clearing/service/model/UpdateClearingStatusDomainServiceRequest"
import { ApproveHoldClearingBalanceDomainService } from "@domain/holderbalance/service/ApproveHoldClearingBalanceDomainService"
import { ApproveRedeemClearingBalanceDomainService } from "@domain/holderbalance/service/ApproveRedeemClearingBalanceDomainService"
import { ApproveTransferClearingBalanceDomainService } from "@domain/holderbalance/service/ApproveTransferClearingBalanceDomainService"
import { ClearingApprovedEvent } from "@domain/clearing/event/ClearingApprovedEvent"
import { UnsupportedClearingOperationTypeError } from "@domain/clearing/errors/UnsupportedClearingOperationTypeError"
import { ClearingOperationType } from "@domain/clearing/model/ClearingOperationType"
import { ClearingStatus } from "@domain/clearing/model/ClearingStatus"
import type { ClearingTransfer } from "@domain/clearing/model/ClearingTransfer"

@Singleton()
@Handler(ApproveClearingCommand)
export class ApproveClearingCommandHandler implements CommandHandler<ApproveClearingCommand, void> {
  constructor(
    private readonly updateClearingHoldStatusDomainService: UpdateClearingHoldStatusDomainService,
    private readonly updateClearingRedeemStatusDomainService: UpdateClearingRedeemStatusDomainService,
    private readonly updateClearingTransferStatusDomainService: UpdateClearingTransferStatusDomainService,
    private readonly approveHoldClearingBalanceDomainService: ApproveHoldClearingBalanceDomainService,
    private readonly approveRedeemClearingBalanceDomainService: ApproveRedeemClearingBalanceDomainService,
    private readonly approveTransferClearingBalanceDomainService: ApproveTransferClearingBalanceDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: ApproveClearingCommand): Promise<void> {
    await this.transactionManager.execute(async (transactionId) => {
      const approvedClearing = await this.updateClearingStatusByType(command, transactionId)

      switch (command.clearingOperationType) {
        case ClearingOperationType.HOLD:
          await this.approveHoldClearingBalanceDomainService.execute(
            approvedClearing.bondContractId,
            approvedClearing.holderAccountId,
            approvedClearing.partition,
            approvedClearing.amount,
            transactionId,
          )
          break

        case ClearingOperationType.REDEEM:
          await this.approveRedeemClearingBalanceDomainService.execute(
            approvedClearing.bondContractId,
            approvedClearing.holderAccountId,
            approvedClearing.partition,
            approvedClearing.amount,
            transactionId,
          )
          break

        case ClearingOperationType.TRANSFER: {
          const transferClearing = approvedClearing as ClearingTransfer
          await this.approveTransferClearingBalanceDomainService.execute(
            transferClearing.bondContractId,
            transferClearing.holderAccountId,
            transferClearing.toAccountId,
            transferClearing.partition,
            transferClearing.amount,
            transactionId,
          )
          break
        }

        default:
          throw UnsupportedClearingOperationTypeError.forType(command.clearingOperationType)
      }

      this.eventBus.publish(new ClearingApprovedEvent(approvedClearing))
    })
  }

  private async updateClearingStatusByType(command: ApproveClearingCommand, transactionId?: string) {
    const request = new UpdateClearingStatusDomainServiceRequest()
    request.bondContractId = command.bondContractId
    request.holderAccountId = command.holderAccountId
    request.clearingId = command.clearingId
    request.newStatus = ClearingStatus.APPROVED

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
