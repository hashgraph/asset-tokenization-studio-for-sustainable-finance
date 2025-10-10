// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty } from 'class-validator'
import { Query } from '@hashgraph/green-bonds-shared-core'
import { GetBondQueryResponse } from './GetBondQueryResponse'

export class GetBondQuery extends Query<GetBondQueryResponse> {
  @IsNotEmpty()
  readonly bondContractId: string

  constructor(bondContractId: string) {
    super()
    this.bondContractId = bondContractId
  }
}
