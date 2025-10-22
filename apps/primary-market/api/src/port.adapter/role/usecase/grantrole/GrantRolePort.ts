// SPDX-License-Identifier: Apache-2.0

import { RoleGrantedDLTEvent } from "./model/RoleGrantedDLTEvent"

export interface GrantRolePort {
  handle(event: RoleGrantedDLTEvent): Promise<void>
}
