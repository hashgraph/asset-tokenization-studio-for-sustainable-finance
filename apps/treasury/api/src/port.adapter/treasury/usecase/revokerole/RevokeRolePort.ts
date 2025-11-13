// SPDX-License-Identifier: Apache-2.0

import { RoleRevokedDLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface RevokeRolePort {
  handle(event: RoleRevokedDLTEvent): Promise<void>
}
