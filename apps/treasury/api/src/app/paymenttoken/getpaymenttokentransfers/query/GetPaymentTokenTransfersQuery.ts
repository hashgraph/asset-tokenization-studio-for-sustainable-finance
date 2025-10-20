// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { PaymentTokenTransferQueryResponse } from "./PaymentTokenTransferQueryResponse"

export class GetPaymentTokenTransfersQuery extends Query<
  QueryPageResponse<PaymentTokenTransferQueryResponse>
> {
  @IsString()
  @IsNotEmpty()
  readonly paymentTokenId: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(paymentTokenId: string, pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT) {
    super()
    this.paymentTokenId = paymentTokenId
    this.pageOptions = pageOptions
  }
}
