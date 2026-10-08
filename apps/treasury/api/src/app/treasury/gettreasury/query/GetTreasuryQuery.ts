import { Query } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"
import { GetTreasuryQueryResponse } from "@app/treasury/gettreasury/query/GetTreasuryQueryResponse"

export class GetTreasuryQuery extends Query<GetTreasuryQueryResponse> {
  @IsNotEmpty()
  readonly treasuryContractId: string

  constructor(treasuryContractId: string) {
    super()
    this.treasuryContractId = treasuryContractId
  }
}
