// SPDX-License-Identifier: Apache-2.0

import { PageOptions, Query, Page } from '@hashgraph/green-bonds-shared-core'
import { Bond } from '@domain/bond/model/Bond'

export class GetBondsQuery extends Query<Page<Bond>> {
  constructor(public readonly pageOptions: PageOptions = PageOptions.DEFAULT) {
    super()
  }
}
