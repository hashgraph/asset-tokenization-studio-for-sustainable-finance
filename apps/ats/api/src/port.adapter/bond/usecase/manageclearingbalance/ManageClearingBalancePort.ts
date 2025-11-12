// SPDX-License-Identifier: Apache-2.0
import { ClearingBalanceChangedEvent } from "@domain/bond/clearinghold/event/ClearingBalanceChangedEvent"

export interface ManageClearingBalancePort {
  handle(event: ClearingBalanceChangedEvent): Promise<void>
}
