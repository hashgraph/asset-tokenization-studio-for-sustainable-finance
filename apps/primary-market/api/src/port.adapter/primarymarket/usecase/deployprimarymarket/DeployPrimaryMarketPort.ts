// SPDX-License-Identifier: Apache-2.0

import { PrimaryMarketDeployedDLTEvent } from "./model/PrimaryMarketDeployedDLTEvent"

export interface DeployPrimaryMarketPort {
  handle(event: PrimaryMarketDeployedDLTEvent): Promise<void>
}
