// SPDX-License-Identifier: Apache-2.0

import { SyncDistributionPort } from "@port/distribution/usecase/syncdistribution/SyncDistributionPort"
import { Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { DistributionExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionExecutedDLTEvent"
import { DistributionByAddressesExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionByAddressesExecutedDLTEvent"
import { SyncDistributionAppService } from "@app/distribution/syncdistribution/service/SyncDistributionAppService"
import { SyncDistributionAppServiceRequest } from "@app/distribution/syncdistribution/service/model/SyncDistributionAppServiceRequest"
import { BaseDistributionExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/BaseDistributionExecutedDLTEvent"
import { BasePaymentNestJSEventAdapter } from "@port/shared/BasePaymentNestJSEventAdapter"

@Singleton()
export class SyncDistributionNestJSEventAdapter extends BasePaymentNestJSEventAdapter implements SyncDistributionPort {
  constructor(private readonly syncDistributionAppService: SyncDistributionAppService) {
    super()
  }

  @Handler(DistributionExecutedDLTEvent)
  async handleDistributionExecuted(event: DistributionExecutedDLTEvent): Promise<void> {
    await this.processDistributionEvent(event)
  }

  @Handler(DistributionByAddressesExecutedDLTEvent)
  async handleDistributionByAddressesExecuted(event: DistributionByAddressesExecutedDLTEvent): Promise<void> {
    await this.processDistributionEvent(event)
  }

  private async processDistributionEvent(event: BaseDistributionExecutedDLTEvent): Promise<void> {
    const successAddresses: string[] = []
    const failedAddresses: string[] = []
    const paidAmounts: string[] = []

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
      }
    }

    const [convertedSuccessAddresses, convertedFailedAddresses] = await Promise.all([
      this.convertToHederaFormat(successAddresses),
      this.convertToHederaFormat(failedAddresses),
    ])

    await this.syncDistributionAppService.execute({
      treasuryContractId: event.contractId,
      distributionId: event.distributionId,
      successAddresses: convertedSuccessAddresses,
      failedAddresses: convertedFailedAddresses,
      paidAmounts,
    } as SyncDistributionAppServiceRequest)
  }
}
