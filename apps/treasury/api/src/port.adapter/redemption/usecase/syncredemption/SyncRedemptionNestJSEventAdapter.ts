// SPDX-License-Identifier: Apache-2.0

import { Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { BasePaymentNestJSEventAdapter } from "@port/shared/BasePaymentNestJSEventAdapter"
import { SyncRedemptionPort } from "@port/redemption/usecase/syncredemption/SyncRedemptionPort"
import { RedemptionExecutedDLTEvent } from "@port/redemption/usecase/syncredemption/model/RedemptionExecutedDLTEvent"
import { RedemptionByAddressesExecutedDLTEvent } from "@port/redemption/usecase/syncredemption/model/RedemptionByAddressesExecutedDLTEvent"
import { BaseRedemptionExecutedDLTEvent } from "@port/redemption/usecase/syncredemption/model/BaseRedemptionExecutedDLTEvent"
import { SyncRedemptionAppService } from "@app/redemption/syncredemption/SyncRedemptionAppService"

@Singleton()
export class SyncRedemptionNestJSEventAdapter extends BasePaymentNestJSEventAdapter implements SyncRedemptionPort {
  constructor(private readonly syncRedemptionAppService: SyncRedemptionAppService) {
    super()
  }

  @Handler(RedemptionExecutedDLTEvent)
  async handleRedemptionExecuted(event: RedemptionExecutedDLTEvent): Promise<void> {
    await this.processRedemptionEvent(event)
  }

  @Handler(RedemptionByAddressesExecutedDLTEvent)
  async handleRedemptionByAddressesExecuted(event: RedemptionByAddressesExecutedDLTEvent): Promise<void> {
    await this.processRedemptionEvent(event)
  }

  private async processRedemptionEvent(event: BaseRedemptionExecutedDLTEvent): Promise<void> {
    const holders = event.results.map((i) => String(i.holder))
    const convertedHolders = await this.convertToHederaFormat(holders)
    const results = event.results.map((item, idx) => ({
      holder: convertedHolders[idx],
      status: Number(item.status),
      amount: String(item.amount),
    }))

    await this.syncRedemptionAppService.execute({
      treasuryContractId: event.contractId,
      results,
    })
  }
}
