// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { ProceedsRecipientQueryResponse } from "./ProceedsRecipientQueryResponse"

export class GetProceedsRecipientsQuery extends Query<QueryPageResponse<ProceedsRecipientQueryResponse>> {
  @IsString()
  @IsNotEmpty()
  readonly treasuryContractId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(treasuryContractId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.treasuryContractId = treasuryContractId
    this.pageOptions = pageOptions
  }
}
