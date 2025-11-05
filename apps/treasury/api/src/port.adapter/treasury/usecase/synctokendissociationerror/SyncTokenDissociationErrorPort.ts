// SPDX-License-Identifier: Apache-2.0

import { TokenDissociatedDLTEvent } from "@port/treasury/usecase/synctokendissociationerror/model/TokenDissociatedDLTEvent"

export interface SyncTokenDissociationErrorPort {
  handle(event: TokenDissociatedDLTEvent): Promise<void>
}
