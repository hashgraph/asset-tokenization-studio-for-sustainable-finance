import { GetTreasuryPort } from "@port/treasury/usecase/gettreasury/GetTreasuryPort"
import { RestController, Inject } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import { GetTreasuryResponse } from "@port/treasury/usecase/gettreasury/model/GetTreasuryResponse"
import { GetTreasuryQuery } from "@app/treasury/gettreasury/query/GetTreasuryQuery"

@RestController("treasuries")
export class GetTreasuryHttpAdapter implements GetTreasuryPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get(":treasuryContractId")
  async getTreasury(@Param("treasuryContractId") treasuryContractId: string): Promise<GetTreasuryResponse> {
    return await this.queryBus.execute(new GetTreasuryQuery(treasuryContractId))
  }
}
