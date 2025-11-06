// SPDX-License-Identifier: Apache-2.0
import { RemovedFromControlListDLTEvent } from "@port/bond/usecase/removecontrollistmember/model/RemovedFromControlListDLTEvent"

export interface RemoveControlListMemberPort {
  handle(event: RemovedFromControlListDLTEvent): Promise<void>
}
