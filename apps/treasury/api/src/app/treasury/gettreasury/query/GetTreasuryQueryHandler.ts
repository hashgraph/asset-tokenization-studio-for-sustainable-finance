import { Handler, QueryHandler, Singleton, Validate, Inject, ConverterUtils } from "@hashgraph/green-bonds-shared-core"
import { GetTreasuryQuery } from "@app/treasury/gettreasury/query/GetTreasuryQuery"
import { GetTreasuryQueryResponse } from "@app/treasury/gettreasury/query/GetTreasuryQueryResponse"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import type { HederaPort } from "@port/blockchain/HederaPort"

@Singleton()
@Handler(GetTreasuryQuery)
export class GetTreasuryQueryHandler implements QueryHandler<GetTreasuryQuery, GetTreasuryQueryResponse> {
  constructor(
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
    @Inject() private readonly hederaPort: HederaPort,
  ) {}

  @Validate()
  async execute(query: GetTreasuryQuery): Promise<GetTreasuryQueryResponse> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(query.treasuryContractId)
    return {
      contractId: treasury.contractId,
      bondContractId: treasury.bondContractId,
      paused: treasury.paused,
      paymentToken: treasury.paymentToken
        ? {
            contractId: treasury.paymentToken.contractId,
            additionDate: treasury.paymentToken.createdAt,
            removalDate: treasury.paymentToken.removalDate,
            balance: ConverterUtils.formatNumber(
              await this.hederaPort.getTokenBalance(treasury.paymentToken.contractId, treasury.contractId),
              treasury.paymentToken.decimals,
            ),
          }
        : undefined,
    }
  }
}
