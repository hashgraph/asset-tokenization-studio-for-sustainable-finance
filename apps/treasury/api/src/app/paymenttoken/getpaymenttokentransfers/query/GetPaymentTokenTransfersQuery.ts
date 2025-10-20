// SPDX-License-Identifier: Apache-2.0

import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { PaymentTokenTransferQueryResponse } from "./PaymentTokenTransferQueryResponse"

export class GetPaymentTokenTransfersQuery extends Query<QueryPageResponse<PaymentTokenTransferQueryResponse>> {
  @IsString()
  @IsNotEmpty()
  readonly treasuryContractId: string

  @IsString()
  @IsNotEmpty()
  readonly paymentTokenId: string

  @IsOptional()
  @IsIn(["INFLOW", "OUTFLOW"])
  readonly type?: string

  @ValidateNested()
  @Type(() => QueryPageOptions)
  readonly pageOptions: QueryPageOptions

  constructor(
    treasuryContractId: string,
    paymentTokenId: string,
    type: string,
    pageOptions: QueryPageOptions = QueryPageOptions.DEFAULT,
  ) {
    super()
    this.treasuryContractId = treasuryContractId
    this.paymentTokenId = paymentTokenId
    this.type = type
    this.pageOptions = pageOptions
  }
}
