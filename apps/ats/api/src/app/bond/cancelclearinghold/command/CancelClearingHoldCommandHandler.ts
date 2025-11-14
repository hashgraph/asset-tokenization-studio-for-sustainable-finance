// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { CancelClearingHoldCommand } from "./CancelClearingHoldCommand"
import type { ClearingHoldRepository } from "@domain/bond/clearinghold/repository/ClearingHoldRepository"
import { ClearingNotFoundError } from "@domain/bond/clearinghold/errors/ClearingNotFoundError"
import { DeleteClearingHoldDomainService } from "@domain/bond/clearinghold/service/DeleteClearingHoldDomainService"
import { DeleteClearingHoldDomainServiceRequest } from "@domain/bond/clearinghold/service/model/DeleteClearingHoldDomainServiceRequest"
import { ClearBondHolderBalanceDomainService } from "@domain/bond/holderbalance/service/ClearBondHolderBalanceDomainService"
import { ClearingCanceledEvent } from "@domain/bond/clearinghold/event/ClearingCanceledEvent"

@Singleton()
@Handler(CancelClearingHoldCommand)
export class CancelClearingHoldCommandHandler implements CommandHandler<CancelClearingHoldCommand, void> {
  constructor(
    private readonly deleteClearingDomainService: DeleteClearingHoldDomainService,
    private readonly clearBondHolderBalanceDomainService: ClearBondHolderBalanceDomainService,
    @Inject("ClearingHoldRepository") private readonly clearingHoldRepository: ClearingHoldRepository,
    @Inject() private readonly transactionManager: TransactionManager,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CancelClearingHoldCommand): Promise<void> {
    await this.transactionManager.execute(async () => {
      const existingClearing = await this.clearingHoldRepository.findById(
        command.bondContractId,
        command.holderAccountId,
        command.clearingId,
      )
      if (!existingClearing) {
        throw new ClearingNotFoundError(
          `${command.bondContractId}/${command.holderAccountId}/${command.clearingId}`,
        )
      }

      const request = new DeleteClearingHoldDomainServiceRequest()
      request.bondContractId = command.bondContractId
      request.holderAccountId = command.holderAccountId
      request.clearingId = command.clearingId

      await this.deleteClearingDomainService.execute(request)

      await this.clearBondHolderBalanceDomainService.execute(
        command.bondContractId,
        command.holderAccountId,
        existingClearing.partition,
        existingClearing.amount,
        "CLEARING_UNLOCK",
      )

      this.eventBus.publish(new ClearingCanceledEvent(existingClearing))
    })
  }
}
