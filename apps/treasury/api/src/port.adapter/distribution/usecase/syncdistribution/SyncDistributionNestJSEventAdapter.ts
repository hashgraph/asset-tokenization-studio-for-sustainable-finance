// SPDX-License-Identifier: Apache-2.0

import { SyncDistributionPort } from "@port/distribution/usecase/syncdistribution/SyncDistributionPort"
import { Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { DistributionExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionExecutedDLTEvent"
import { DistributionByAddressesExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionByAddressesExecutedDLTEvent"
import { SyncDistributionAppService } from "@app/distribution/syncdistribution/service/SyncDistributionAppService"
import { SyncDistributionAppServiceRequest } from "@app/distribution/syncdistribution/service/model/SyncDistributionAppServiceRequest"

@Singleton()
export class SyncDistributionNestJSEventAdapter implements SyncDistributionPort {
  constructor(private readonly syncDistributionAppService: SyncDistributionAppService) {}

  @Handler(DistributionExecutedDLTEvent)
  async handleDistributionExecuted(event: DistributionExecutedDLTEvent): Promise<void> {
    await this.syncDistributionAppService.execute({
      treasuryContractId: event.contractId,
      distributionId: parseInt(event.distributionId),
      successAddresses: event.successAddresses,
      failedAddresses: event.failedAddresses,
      paidAmounts: event.paidAmounts,
    } as SyncDistributionAppServiceRequest)
  }

  @Handler(DistributionByAddressesExecutedDLTEvent)
  async handleDistributionByAddressesExecuted(event: DistributionByAddressesExecutedDLTEvent): Promise<void> {
    await this.syncDistributionAppService.execute({
      treasuryContractId: event.contractId,
      distributionId: parseInt(event.distributionId),
      successAddresses: event.successAddresses,
      failedAddresses: event.failedAddresses,
      paidAmounts: event.paidAmounts,
    } as SyncDistributionAppServiceRequest)
  }
}
