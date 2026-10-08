// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested, IsOptional, IsIn } from "class-validator"
import { Type } from "class-transformer"
import { EnvironmentalAssetTransferQueryResponse } from "./EnvironmentalAssetTransferQueryResponse"

export class GetEnvironmentalAssetTransfersQuery extends Query<
  QueryPageResponse<EnvironmentalAssetTransferQueryResponse>
> {
  @IsString()
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsString()
  @IsNotEmpty()
  readonly environmentalAssetContractId: string

  @IsOptional()
  @IsIn(["INFLOW", "OUTFLOW"])
  readonly type?: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(
    treasuryContractId: string,
    environmentalAssetContractId: string,
    type?: string,
    pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
    this.treasuryContractId = treasuryContractId
    this.environmentalAssetContractId = environmentalAssetContractId
    this.type = type
    this.pageOptions = pageOptions
  }
}
