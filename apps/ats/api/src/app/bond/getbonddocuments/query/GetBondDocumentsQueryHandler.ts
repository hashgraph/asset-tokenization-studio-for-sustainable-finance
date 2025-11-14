// SPDX-License-Identifier: Apache-2.0

import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondDocumentRepository } from "@domain/bond/document/repository/BondDocumentRepository"
import { GetBondDocumentsQuery } from "./GetBondDocumentsQuery"
import { BondDocumentQueryResponse } from "@app/bond/getbonddocuments/query/BondDocumentQueryResponse"
import { BondDocument } from "@domain/bond/document/model/BondDocument"

@Singleton()
@Handler(GetBondDocumentsQuery)
export class GetBondDocumentsQueryHandler
  implements QueryHandler<GetBondDocumentsQuery, QueryPageResponse<BondDocumentQueryResponse>>
{
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondDocumentRepository: BondDocumentRepository,
  ) {}

  @Validate()
  async execute(query: GetBondDocumentsQuery): Promise<QueryPageResponse<BondDocumentQueryResponse>> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const page = await this.bondDocumentRepository.findAllByContractIdPaginated(
      query.bondContractId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (document: BondDocument) => ({
      name: document.name,
      uri: document.uri,
      hash: document.hash,
    }))
  }
}
