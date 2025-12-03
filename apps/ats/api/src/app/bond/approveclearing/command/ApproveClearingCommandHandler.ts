// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { ApproveClearingCommand } from "./ApproveClearingCommand"
import { UpdateClearingHoldStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingHoldStatusDomainService"
import { UpdateClearingRedeemStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingRedeemStatusDomainService"
import { UpdateClearingTransferStatusDomainService } from "@domain/bond/clearing/service/UpdateClearingTransferStatusDomainService"
import { UpdateClearingStatusDomainServiceRequest } from "@domain/bond/clearing/service/model/UpdateClearingStatusDomainServiceRequest"
import { ApproveHoldClearingBalanceDomainService } from "@domain/bond/holderbalance/service/ApproveHoldClearingBalanceDomainService"
import { ApproveRedeemClearingBalanceDomainService } from "@domain/bond/holderbalance/service/ApproveRedeemClearingBalanceDomainService"
import { ApproveTransferClearingBalanceDomainService } from "@domain/bond/holderbalance/service/ApproveTransferClearingBalanceDomainService"
import { ClearingApprovedEvent } from "@domain/bond/clearing/event/ClearingApprovedEvent"
import { UnsupportedClearingOperationTypeError } from "@domain/bond/clearing/errors/UnsupportedClearingOperationTypeError"
import { ClearingOperationType } from "@domain/bond/clearing/model/ClearingOperationType"
import { ClearingStatus } from "@domain/bond/clearing/model/ClearingStatus"
import type { ClearingTransfer } from "@domain/bond/clearing/model/ClearingTransfer"
import type { ClearingHold } from "@domain/bond/clearing/model/ClearingHold"
import { CreateBondHoldDomainService } from "@domain/bond/hold/service/CreateBondHoldDomainService"
import { CreateBondHoldDomainServiceRequest } from "@domain/bond/hold/service/model/CreateBondHoldDomainServiceRequest"

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
    private readonly createBondHoldDomainService: CreateBondHoldDomainService,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: ApproveClearingCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
      const approvedClearing = await this.updateClearingStatusByType(command)

      switch (command.clearingOperationType) {
        case ClearingOperationType.HOLD: {
          const holdClearing = approvedClearing as ClearingHold
          await this.approveHoldClearingBalanceDomainService.execute(
            holdClearing.bondContractId,
            holdClearing.holderAccountId,
            holdClearing.partition,
            holdClearing.amount,
          )

          if (command.holdId !== undefined) {
            const createBondHoldRequest = new CreateBondHoldDomainServiceRequest(
              holdClearing.bondContractId,
              command.holdId,
              holdClearing.holderAccountId,
              holdClearing.partition,
              holdClearing.amount,
              holdClearing.expirationDate,
              holdClearing.escrowAccountId,
              holdClearing.toAccountId ?? holdClearing.escrowAccountId,
              holdClearing.data ?? "",
              holdClearing.operatorData ?? "",
              holdClearing.operatorAccountId,
            )

            await this.createBondHoldDomainService.execute(createBondHoldRequest)
          }
          break
        }

        case ClearingOperationType.REDEEM:
          await this.approveRedeemClearingBalanceDomainService.execute(
            approvedClearing.bondContractId,
            approvedClearing.holderAccountId,
            approvedClearing.partition,
            approvedClearing.amount,
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
          )
          break
        }

        default:
          throw UnsupportedClearingOperationTypeError.forType(command.clearingOperationType)
      }

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
        return await this.updateClearingTransferStatusDomainService.execute(request)
      case ClearingOperationType.REDEEM:
        return await this.updateClearingRedeemStatusDomainService.execute(request)
      default:
        throw UnsupportedClearingOperationTypeError.forType(command.clearingOperationType)
    }
  }
}
