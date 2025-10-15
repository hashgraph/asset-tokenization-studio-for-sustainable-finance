// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetTransferQueryResponse } from "./EnvironmentalAssetTransferQueryResponse"

export class GetEnvironmentalAssetTransfersQuery extends Query<
  QueryPageResponse<EnvironmentalAssetTransferQueryResponse>
> {
  constructor(
    public readonly environmentalAssetContractId: string,
    public readonly pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
  }
}
