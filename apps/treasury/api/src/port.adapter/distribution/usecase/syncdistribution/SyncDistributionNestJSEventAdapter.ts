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
    const holders = event.results.map((i) => String(i.holder))
    const convertedHolders = await this.convertToHederaFormat(holders)
    const results = event.results.map((item, idx) => ({
      holder: convertedHolders[idx],
      status: Number(item.status),
      amount: String(item.amount),
    }))

    await this.syncDistributionAppService.execute({
      treasuryContractId: event.contractId,
      distributionId: event.distributionId,
      results,
    } as SyncDistributionAppServiceRequest)
  }
}
