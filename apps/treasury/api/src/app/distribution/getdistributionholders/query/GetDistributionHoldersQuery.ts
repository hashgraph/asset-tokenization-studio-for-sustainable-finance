// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested, IsOptional, IsIn, IsNumber } from "class-validator"
import { Type } from "class-transformer"
import { DistributionHolderQueryResponse } from "./DistributionHolderQueryResponse"

export class GetDistributionHoldersQuery extends Query<QueryPageResponse<DistributionHolderQueryResponse>> {
  @IsString()
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsNumber()
  readonly distributionId: number

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  @IsOptional()
  @IsString()
  @IsIn(["SUCCESS", "FAILED", "ALREADY_PAID"])
  readonly status?: string

  constructor(
    treasuryContractId: string,
    distributionId: number,
    pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
    status?: string,
  ) {
    super()
    this.treasuryContractId = treasuryContractId
    this.distributionId = distributionId
    this.pageOptions = pageOptions
    this.status = status
  }
}
