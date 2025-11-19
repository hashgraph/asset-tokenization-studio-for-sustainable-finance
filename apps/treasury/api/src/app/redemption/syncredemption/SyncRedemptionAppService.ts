// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { SyncRedemptionAppServiceRequest } from "@app/redemption/syncredemption/model/SyncRedemptionAppServiceRequest"
import { AddRedemptionHolderCommand } from "@app/redemption/addredemptionholder/AddRedemptionHolderCommand"
import { RedemptionHolderStatus } from "@domain/redemption/model/RedemptionHolderStatus"
import { PaymentResultItemAppServiceRequestModel } from "@app/shared/model/PaymentResultItemAppServiceRequestModel"

@Singleton()
export class SyncRedemptionAppService {
  constructor(
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Validate()
  async execute(request: SyncRedemptionAppServiceRequest): Promise<void> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(request.treasuryContractId)

    treasury.ensurePaymentTokenConfigured()
    const paymentTokenId = (treasury.paymentToken as any).id
    await this.processResults(request.results, treasury.id, paymentTokenId)
  }

  private async processResults(
    items: PaymentResultItemAppServiceRequestModel[],
    treasuryId: string,
    paymentTokenId: string,
  ): Promise<void> {
    for (const item of items) {
      if (item.status === 0) {
        await this.commandBus.execute(
          new AddRedemptionHolderCommand(
            item.holder,
            RedemptionHolderStatus.SUCCESS,
            item.amount,
            treasuryId,
            paymentTokenId,
          ),
        )
      } else if (item.status === 1) {
        await this.commandBus.execute(
          new AddRedemptionHolderCommand(
            item.holder,
            RedemptionHolderStatus.FAILED,
            undefined,
            treasuryId,
            paymentTokenId,
          ),
        )
      }
    }
  }
}
