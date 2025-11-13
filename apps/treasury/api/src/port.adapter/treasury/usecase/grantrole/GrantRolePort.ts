// SPDX-License-Identifier: Apache-2.0

import { RoleGrantedDLTEvent } from "@hashgraph/green-bonds-shared-core"

export interface GrantRolePort {
  handle(event: RoleGrantedDLTEvent): Promise<void>
}
