// SPDX-License-Identifier: Apache-2.0

import { RolesAppliedDLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface SyncUserRolesPort {
  handle(event: RolesAppliedDLTEvent): Promise<void>
}
