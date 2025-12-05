// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  Singleton,
  Validate,
  QueryPageResponse,
} from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondProceedRecipientRepository } from "@domain/proceedrecipient/repository/BondProceedRecipientRepository"
import { GetBondProceedRecipientsQuery } from "./GetBondProceedRecipientsQuery"
import { BondProceedRecipientsQueryResponse } from "./BondProceedRecipientsQueryResponse"
import { BondProceedRecipient } from "@domain/proceedrecipient/model/BondProceedRecipient"

@Singleton()
@Handler(GetBondProceedRecipientsQuery)
export class GetBondProceedRecipientsQueryHandler
  implements QueryHandler<GetBondProceedRecipientsQuery, QueryPageResponse<BondProceedRecipientsQueryResponse>>
{
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondProceedRecipientRepository: BondProceedRecipientRepository,
  ) {}

  @Validate()
  async execute(query: GetBondProceedRecipientsQuery): Promise<QueryPageResponse<BondProceedRecipientsQueryResponse>> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const page = await this.bondProceedRecipientRepository.findByContractId(
      query.bondContractId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (recipient: BondProceedRecipient) => ({
      id: recipient.id,
      contractId: recipient.contractId,
      proceedRecipientAddress: recipient.proceedRecipientAddress,
      data: recipient.data,
      createdAt: recipient.createdAt,
      updatedAt: recipient.updatedAt,
    }))
  }
}
