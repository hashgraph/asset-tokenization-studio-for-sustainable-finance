// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import type { ProceedsRecipientRepository } from "@domain/proceedsrecipient/repositories/ProceedsRecipientRepository"
import { GetProceedsRecipientsQuery } from "./GetProceedsRecipientsQuery"
import { ProceedsRecipientQueryResponse } from "./ProceedsRecipientQueryResponse"
import { ProceedsRecipient } from "@domain/proceedsrecipient/model/ProceedsRecipient"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"

@Singleton()
@Handler(GetProceedsRecipientsQuery)
export class GetProceedsRecipientsQueryHandler
  implements QueryHandler<GetProceedsRecipientsQuery, QueryPageResponse<ProceedsRecipientQueryResponse>>
{
  constructor(
    @Inject("ProceedsRecipientRepository")
    private readonly proceedsRecipientRepository: ProceedsRecipientRepository,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
  ) {}

  @Validate()
  async execute(query: GetProceedsRecipientsQuery): Promise<QueryPageResponse<ProceedsRecipientQueryResponse>> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(query.treasuryContractId)

    const proceedsRecipientsPage = await this.proceedsRecipientRepository.findByTreasuryId(
      treasury.id,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(proceedsRecipientsPage, (proceedsRecipient: ProceedsRecipient) => ({
      contractId: proceedsRecipient.contractId,
      createdAt: proceedsRecipient.createdAt,
    }))
  }
}
