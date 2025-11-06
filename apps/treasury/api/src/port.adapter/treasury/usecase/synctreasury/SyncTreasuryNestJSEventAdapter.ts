// SPDX-License-Identifier: Apache-2.0

import { SyncTreasuryPort } from "@port/treasury/usecase/synctreasury/SyncTreasuryPort"
import { Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { BondSuiteDeployedDLTEvent } from "@port/treasury/usecase/synctreasury/model/BondSuiteDeployedDLTEvent"
import { SyncTreasuryAppService } from "@app/treasury/synctreasury/service/SyncTreasuryAppService"
import { SyncTreasuryAppServiceRequest } from "@app/treasury/synctreasury/service/model/SyncTreasuryAppServiceRequest"

@Singleton()
export class SyncTreasuryNestJSEventAdapter implements SyncTreasuryPort {
  constructor(private readonly syncTreasuryAppService: SyncTreasuryAppService) {}

  @Handler(BondSuiteDeployedDLTEvent)
  async handleBondSuiteDeployed(event: BondSuiteDeployedDLTEvent): Promise<void> {
    await this.syncTreasuryAppService.execute({
      treasuryContractId: event.treasuryAddress,
      bondContractId: event.bondAddress,
      paymentToken: event.treasuryData.paymentToken,
      environmentalAssets: event.treasuryData.environmentalAssets,
    } as SyncTreasuryAppServiceRequest)
  }
}
