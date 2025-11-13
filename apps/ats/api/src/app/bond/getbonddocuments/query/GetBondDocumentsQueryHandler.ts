// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondDocumentRepository } from "@domain/bond/document/repository/BondDocumentRepository"
import { GetBondDocumentsQuery } from "./GetBondDocumentsQuery"
import { BondDocumentsQueryResponse } from "./BondDocumentsQueryResponse"

@Singleton()
@Handler(GetBondDocumentsQuery)
export class GetBondDocumentsQueryHandler implements QueryHandler<GetBondDocumentsQuery, BondDocumentsQueryResponse> {
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondDocumentRepository: BondDocumentRepository,
  ) {}

  @Validate()
  async execute(query: GetBondDocumentsQuery): Promise<BondDocumentsQueryResponse> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const page = await this.bondDocumentRepository.findAllByContractIdPaginated(
      query.bondContractId,
      query.pageOptions.toPageOptions(),
    )

    return {
      documents: page.items.map((document) => ({
        name: document.name,
        uri: document.uri,
        hash: document.hash,
      })),
    }
  }
}
