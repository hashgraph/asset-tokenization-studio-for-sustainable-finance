// SPDX-License-Identifier: Apache-2.0

import { Query, PageOptions, Page } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"

export class GetEnvironmentalAssetsQuery extends Query<Page<EnvironmentalAsset>> {
  constructor(
    public readonly treasuryContractId: string,
    public readonly pageOptions: PageOptions = PageOptions.DEFAULT,
  ) {
    super()
  }
}
