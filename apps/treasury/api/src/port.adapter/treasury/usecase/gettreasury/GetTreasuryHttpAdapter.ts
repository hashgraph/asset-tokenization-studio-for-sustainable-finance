import { GetTreasuryPort } from "@port/treasury/usecase/gettreasury/GetTreasuryPort"
import { RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param } from "@nestjs/common"
import { GetTreasuryAppService } from "@app/treasury/gettreasury/service/GetTreasuryAppService"
import { GetTreasuryResponse } from "@port/treasury/usecase/gettreasury/model/GetTreasuryResponse"

@RestController("treasuries")
export class GetTreasuryHttpAdapter implements GetTreasuryPort {
  constructor(private readonly getTreasuryAppService: GetTreasuryAppService) {}

  @Get(":treasuryContractId")
  async getTreasury(@Param("treasuryContractId") treasuryContractId: string): Promise<GetTreasuryResponse> {
    return await this.getTreasuryAppService.execute({ treasuryContractId })
  }
}
