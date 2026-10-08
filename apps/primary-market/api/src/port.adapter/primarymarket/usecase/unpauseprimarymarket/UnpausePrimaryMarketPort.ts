// SPDX-License-Identifier: Apache-2.0

import { TokenUnpausedDLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface UnpausePrimaryMarketPort {
  handle(event: TokenUnpausedDLTEvent): Promise<void>
}
