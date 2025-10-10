// SPDX-License-Identifier: Apache-2.0

import { Handler, Inject, Page, QueryHandler, Singleton, Validate } from '@hashgraph/green-bonds-shared-core'
import type { BondRepository } from '@domain/bond/repositories/BondRepository'
import { Bond } from '@domain/bond/model/Bond'
import { GetBondsQuery } from './GetBondsQuery'

@Singleton()
@Handler(GetBondsQuery)
export class GetBondsQueryHandler implements QueryHandler<GetBondsQuery, Page<Bond>> {
  constructor(@Inject('BondRepository') private readonly bondRepository: BondRepository) {}

  @Validate()
  async execute(query: GetBondsQuery): Promise<Page<Bond>> {
    return await this.bondRepository.findAll(query.pageOptions)
  }
}
