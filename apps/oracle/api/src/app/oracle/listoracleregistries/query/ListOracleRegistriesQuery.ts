// SPDX-License-Identifier: Apache-2.0
import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { OracleRegistryQueryResponse } from "./OracleRegistryQueryResponse"

export class ListOracleRegistriesQuery extends Query<QueryPageResponse<OracleRegistryQueryResponse>> {
  constructor(public readonly pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
  }
}
