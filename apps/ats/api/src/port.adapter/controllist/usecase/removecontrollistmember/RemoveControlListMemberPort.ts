// SPDX-License-Identifier: Apache-2.0
import { RemovedFromControlListDLTEvent } from "@port/controllist/usecase/removecontrollistmember/model/RemovedFromControlListDLTEvent"

export interface RemoveControlListMemberPort {
  handle(event: RemovedFromControlListDLTEvent): Promise<void>
}
