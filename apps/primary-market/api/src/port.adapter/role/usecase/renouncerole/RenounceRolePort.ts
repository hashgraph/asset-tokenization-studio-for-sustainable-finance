// SPDX-License-Identifier: Apache-2.0

import {RoleRenouncedDLTEvent} from "@hashgraph/green-bonds-shared-core";

export interface RenounceRolePort {
    handle(event: RoleRenouncedDLTEvent): Promise<void>
}
