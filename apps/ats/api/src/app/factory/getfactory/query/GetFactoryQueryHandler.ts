// SPDX-License-Identifier: Apache-2.0

import { QueryHandler, Handler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckFactoryExistsDomainService } from "@domain/factory/service/CheckFactoryExistsDomainService"
import { GetFactoryQuery } from "./GetFactoryQuery"
import { FactoryQueryResponse } from "./FactoryQueryResponse"

@Singleton()
@Handler(GetFactoryQuery)
export class GetFactoryQueryHandler implements QueryHandler<GetFactoryQuery, FactoryQueryResponse> {
  constructor(private readonly checkFactoryExistsDomainService: CheckFactoryExistsDomainService) {}

  @Validate()
  async execute(query: GetFactoryQuery): Promise<FactoryQueryResponse> {
    const { factoryContractId } = query
    const factory = await this.checkFactoryExistsDomainService.execute(factoryContractId)

    return Object.assign(new FactoryQueryResponse(), {
      factoryContractId: factory.contractId,
      isPaused: factory.isPaused,
      createdAt: factory.createdAt,
    })
  }
}
