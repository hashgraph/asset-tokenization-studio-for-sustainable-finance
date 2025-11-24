// SPDX-License-Identifier: Apache-2.0

import { TokenPausedDLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface PausePrimaryMarketFactoryPort {
  handle(event: TokenPausedDLTEvent): Promise<void>
}
