// SPDX-License-Identifier: Apache-2.0

import { PrimaryMarketDeployedEvent } from "@domain/primarymarket/events/PrimaryMarketDeployedEvent"

export interface CreatePrimaryMarketFiltersPort {
  handle(event: PrimaryMarketDeployedEvent): Promise<void>
}
