// SPDX-License-Identifier: Apache-2.0

import { DeletedFromControlListDLTEvent } from "@port/bond/usecase/deletecontrollistmember/model/DeletedFromControlListDLTEvent"

export interface DeleteControlListMemberPort {
  handle(event: DeletedFromControlListDLTEvent): Promise<void>
}
