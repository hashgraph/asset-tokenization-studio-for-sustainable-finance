// SPDX-License-Identifier: Apache-2.0

import { BondSuiteDeployedDLTEvent } from "@port/treasury/usecase/synctreasury/model/BondSuiteDeployedDLTEvent"

export interface SyncTreasuryPort {
  handleBondSuiteDeployed(event: BondSuiteDeployedDLTEvent): Promise<void>
}
