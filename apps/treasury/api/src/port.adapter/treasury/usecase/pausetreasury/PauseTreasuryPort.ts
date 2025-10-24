// SPDX-License-Identifier: Apache-2.0

import { TokenPausedDLTEvent } from "@port/treasury/usecase/pausetreasury/model/TokenPausedDLTEvent"

export interface PauseTreasuryPort {
  handle(event: TokenPausedDLTEvent): Promise<void>
}
