// SPDX-License-Identifier: Apache-2.0
import { PageResponse, PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { ControlListMembersResponse } from "./model/ControlListMembersResponse"

export interface GetControlListMembersPort {
  getControlListMembers(
    bondContractId: string,
    pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<ControlListMembersResponse>>
}
