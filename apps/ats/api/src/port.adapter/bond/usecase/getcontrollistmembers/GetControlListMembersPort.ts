// SPDX-License-Identifier: Apache-2.0
import { PageResponse, QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { ControlListMembersResponse } from "./model/ControlListMembersResponse"

export interface GetControlListMembersPort {
  getControlListMembers(
    bondContractId: string,
    queryPageRequest: QueryPageRequest,
  ): Promise<PageResponse<ControlListMembersResponse>>
}
