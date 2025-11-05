// SPDX-License-Identifier: Apache-2.0
import { AddedToControlListDLTEvent } from "@port/bond/usecase/addcontrollistmember/model/AddedToControlListDLTEvent"

export interface AddControlListMemberPort {
  handle(event: AddedToControlListDLTEvent): Promise<void>
}
