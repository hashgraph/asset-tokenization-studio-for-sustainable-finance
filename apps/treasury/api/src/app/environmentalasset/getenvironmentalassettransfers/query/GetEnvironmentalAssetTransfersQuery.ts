// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { EnvironmentalAssetTransferQueryResponse } from "./EnvironmentalAssetTransferQueryResponse"

export class GetEnvironmentalAssetTransfersQuery extends Query<
  QueryPageResponse<EnvironmentalAssetTransferQueryResponse>
> {
  @IsString()
  @IsNotEmpty()
  readonly environmentalAssetContractId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(environmentalAssetContractId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.environmentalAssetContractId = environmentalAssetContractId
    this.pageOptions = pageOptions
  }
}
