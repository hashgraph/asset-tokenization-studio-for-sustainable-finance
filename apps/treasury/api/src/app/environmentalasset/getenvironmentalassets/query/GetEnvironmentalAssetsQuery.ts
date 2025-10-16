// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetQueryResponse } from "./EnvironmentalAssetQueryResponse"
import { IsNotEmpty, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class GetEnvironmentalAssetsQuery extends Query<QueryPageResponse<EnvironmentalAssetQueryResponse>> {
  @IsNotEmpty()
  readonly treasuryContractId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT

  constructor(treasuryContractId: string, pageOptions: QueryPageOptions) {
    super()
    this.treasuryContractId = treasuryContractId
    this.pageOptions = pageOptions
  }
}
