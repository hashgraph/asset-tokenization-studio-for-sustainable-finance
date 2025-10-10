import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { GetTreasuryAppServiceRequest } from "@app/treasury/gettreasury/service/model/GetTreasuryAppServiceRequest"
import { GetTreasuryAppServiceResponse } from "@app/treasury/gettreasury/service/model/GetTreasuryAppServiceResponse"
import type { HederaPort } from "@port/blockchain/HederaPort"
import { GetTreasuryQuery } from "@app/treasury/gettreasury/query/GetTreasuryQuery"
import { GetTreasuryQueryResponse } from "@app/treasury/gettreasury/query/GetTreasuryQueryResponse"

@Singleton()
export class GetTreasuryAppService {
  constructor(
    @Inject() private readonly hederaPort: HederaPort,
    @Inject() private readonly queryBus: QueryBus,
  ) {}

  @Validate()
  async execute(request: GetTreasuryAppServiceRequest): Promise<GetTreasuryAppServiceResponse> {
    const treasury: GetTreasuryQueryResponse = await this.queryBus.execute(
      new GetTreasuryQuery(request.treasuryContractId),
    )
    return {
      contractId: treasury.contractId,
      bondContractId: treasury.bondContractId,
      paused: treasury.paused,
      paymentToken: treasury.paymentToken
        ? {
            contractId: treasury.paymentToken.contractId,
            validityDate: treasury.paymentToken.validityDate,
            balance: await this.hederaPort.getTokenBalance(treasury.paymentToken.contractId, treasury.contractId),
          }
        : null,
    }
  }
}
