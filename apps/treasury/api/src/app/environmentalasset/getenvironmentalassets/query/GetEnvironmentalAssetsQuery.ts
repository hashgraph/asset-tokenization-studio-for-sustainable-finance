// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetQueryResponse } from "./EnvironmentalAssetQueryResponse"

export class GetEnvironmentalAssetsQuery extends Query<EnvironmentalAssetQueryResponse> {
  constructor(
    public readonly treasuryContractId: string,
    public readonly pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
  }
}
