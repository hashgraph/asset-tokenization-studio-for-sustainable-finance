// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { PaymentTokenQueryResponse } from "./PaymentTokenQueryResponse"

export class GetPaymentTokensQuery extends Query<QueryPageResponse<PaymentTokenQueryResponse>> {
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
