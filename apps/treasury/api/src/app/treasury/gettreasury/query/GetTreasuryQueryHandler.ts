import { Handler, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { GetTreasuryQuery } from "@app/treasury/gettreasury/query/GetTreasuryQuery"
import { GetTreasuryQueryResponse } from "@app/treasury/gettreasury/query/GetTreasuryQueryResponse"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"

@Singleton()
@Handler(GetTreasuryQuery)
export class GetTreasuryQueryHandler implements QueryHandler<GetTreasuryQuery, GetTreasuryQueryResponse> {
  constructor(private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService) {}

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
          }
        : undefined,
    }
  }
}
