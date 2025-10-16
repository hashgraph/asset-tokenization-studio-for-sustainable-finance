// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { EnvironmentalAssetHoldingsQueryResponse } from "./EnvironmentalAssetHoldingsQueryResponse"

export class GetEnvironmentalAssetHoldingsQuery extends Query<
  QueryPageResponse<EnvironmentalAssetHoldingsQueryResponse>
> {
  @IsString()
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsString()
  @IsNotEmpty()
  readonly assetContractId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(
    treasuryContractId: string,
    assetContractId: string,
    pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
    this.treasuryContractId = treasuryContractId
    this.assetContractId = assetContractId
    this.pageOptions = pageOptions
  }
}
