// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { ProceedsRecipientAllocationQueryResponse } from "./ProceedsRecipientAllocationQueryResponse"

export class GetProceedsRecipientAllocationsQuery extends Query<
  QueryPageResponse<ProceedsRecipientAllocationQueryResponse>
> {
  @IsString()
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsString()
  @IsNotEmpty()
  readonly recipientContractId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(
    treasuryContractId: string,
    recipientContractId: string,
    pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
    this.treasuryContractId = treasuryContractId
    this.recipientContractId = recipientContractId
    this.pageOptions = pageOptions
  }
}
