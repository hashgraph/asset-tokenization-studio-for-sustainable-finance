// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested, IsOptional, IsIn } from "class-validator"
import { Type } from "class-transformer"
import { RedemptionHolderQueryResponse } from "./RedemptionHolderQueryResponse"

export class GetRedemptionHoldersQuery extends Query<QueryPageResponse<RedemptionHolderQueryResponse>> {
  @IsString()
  @IsNotEmpty()
  readonly treasuryContractId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  @IsOptional()
  @IsString()
  @IsIn(["SUCCESS", "FAILED", "ALREADY_PAID"])
  readonly status?: string

  constructor(treasuryContractId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT, status?: string) {
    super()
    this.treasuryContractId = treasuryContractId
    this.pageOptions = pageOptions
    this.status = status
  }
}
