// SPDX-License-Identifier: Apache-2.0

import { SyncTreasuryPort } from "@port/treasury/usecase/synctreasury/SyncTreasuryPort"
import { ConverterUtils, Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { BondSuiteDeployedDLTEvent } from "@port/treasury/usecase/synctreasury/model/BondSuiteDeployedDLTEvent"
import { SyncTreasuryAppService } from "@app/treasury/synctreasury/service/SyncTreasuryAppService"
import { SyncTreasuryAppServiceRequest } from "@app/treasury/synctreasury/service/model/SyncTreasuryAppServiceRequest"

@Singleton()
export class SyncTreasuryNestJSEventAdapter implements SyncTreasuryPort {
  constructor(private readonly syncTreasuryAppService: SyncTreasuryAppService) {}

  @Handler(BondSuiteDeployedDLTEvent)
  async handleBondSuiteDeployed(event: BondSuiteDeployedDLTEvent): Promise<void> {
    const [treasuryContractId, bondContractId, paymentToken, ...environmentalAssets] = await Promise.all([
      ConverterUtils.getHederaAddressFromEvm(event.treasuryAddress),
      ConverterUtils.getHederaAddressFromEvm(event.bondAddress),
      ConverterUtils.getHederaAddressFromEvm(event.treasuryData.paymentToken),
      ...event.treasuryData.environmentalAssets.map((asset) => ConverterUtils.getHederaAddressFromEvm(asset)),
    ])

    await this.syncTreasuryAppService.execute({
      treasuryContractId,
      bondContractId,
      paymentToken,
      environmentalAssets,
    } as SyncTreasuryAppServiceRequest)
  }
}
