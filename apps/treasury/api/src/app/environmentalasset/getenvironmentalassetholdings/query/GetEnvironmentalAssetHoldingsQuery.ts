// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetHoldingsQueryResponse } from "./EnvironmentalAssetHoldingsQueryResponse"

export class GetEnvironmentalAssetHoldingsQuery extends Query<
  QueryPageResponse<EnvironmentalAssetHoldingsQueryResponse>
> {
  constructor(
    public readonly treasuryContractId: string,
    public readonly assetContractId: string,
    public readonly pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
  }
}
