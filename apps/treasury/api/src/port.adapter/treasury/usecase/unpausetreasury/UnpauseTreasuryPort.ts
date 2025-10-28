// SPDX-License-Identifier: Apache-2.0

import { TokenUnpausedDLTEvent } from "@port/treasury/usecase/unpausetreasury/model/TokenUnpausedDLTEvent"

export interface UnpauseTreasuryPort {
  handle(event: TokenUnpausedDLTEvent): Promise<void>
}
