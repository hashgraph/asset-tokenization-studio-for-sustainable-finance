// SPDX-License-Identifier: Apache-2.0

import { QueryPageResponse, QueryPageable } from "@hashgraph/green-bonds-shared-core"
import { BondQueryDTO } from "./BondQueryDTO"
import { Bond } from "@domain/bond/model/Bond"

export class BondQueryResponse extends QueryPageResponse<BondQueryDTO> {
  static fromDomainPage(page: QueryPageable<Bond>): BondQueryResponse {
    const transform = (bond: Bond) => BondQueryDTO.fromDomain(bond)
    return QueryPageResponse.fromPage(page, transform) as BondQueryResponse
  }
}
