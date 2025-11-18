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
    const successAddresses: string[] = []
    const failedAddresses: string[] = []
    const alreadyPaidAddresses: string[] = []
    const paidAmounts: string[] = []
    const alreadyPaidAmounts: string[] = []

    for (const item of event.result) {
      const holder = String(item.holder)
      const code = Number(item.status)
      const amount = String(item.amount)
      if (!this.isNonZeroAddress(holder)) {
        continue
      }
      if (code === 0) {
        successAddresses.push(holder)
        paidAmounts.push(amount)
      } else if (code === 1) {
        failedAddresses.push(holder)
      } else if (code === 2) {
        alreadyPaidAddresses.push(holder)
        alreadyPaidAmounts.push(amount)
      }
    }

    const [convertedSuccessAddresses, convertedFailedAddresses, convertedAlreadyPaidAddresses] = await Promise.all([
      this.convertToHederaFormat(successAddresses),
      this.convertToHederaFormat(failedAddresses),
      this.convertToHederaFormat(alreadyPaidAddresses),
    ])

    await this.syncRedemptionAppService.execute({
      treasuryContractId: event.contractId,
      successAddresses: convertedSuccessAddresses,
      failedAddresses: convertedFailedAddresses,
      paidAmounts,
      alreadyPaidAddresses: convertedAlreadyPaidAddresses,
      alreadyPaidAmounts,
    })
  }
}
