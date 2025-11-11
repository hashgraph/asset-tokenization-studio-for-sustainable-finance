// SPDX-License-Identifier: Apache-2.0

import { TreasuryCreatedEvent } from "@domain/treasury/event/TreasuryCreatedEvent"

export interface CreateTreasuryFiltersPort {
  handle(event: TreasuryCreatedEvent): Promise<void>
}
