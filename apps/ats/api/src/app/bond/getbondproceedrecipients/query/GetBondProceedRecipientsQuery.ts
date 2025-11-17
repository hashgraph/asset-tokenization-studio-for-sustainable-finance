// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Query, QueryPageOptions, QueryPageResponse } from "@hashgraph/green-bonds-shared-core"
import { BondProceedRecipientsQueryResponse } from "./BondProceedRecipientsQueryResponse"

export class GetBondProceedRecipientsQuery extends Query<QueryPageResponse<BondProceedRecipientsQueryResponse>> {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  pageOptions: QueryPageOptions

  constructor(bondContractId: string, pageOptions: QueryPageOptions) {
    super()
    this.bondContractId = bondContractId
    this.pageOptions = pageOptions
  }
}
