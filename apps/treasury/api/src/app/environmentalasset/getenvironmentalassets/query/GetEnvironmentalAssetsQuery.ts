// SPDX-License-Identifier: Apache-2.0

import { QueryPageable, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAsset } from "@domain/environmentalasset/model/EnvironmentalAsset"

export class GetEnvironmentalAssetsQuery extends QueryPageable<EnvironmentalAsset> {
  constructor(
    public readonly treasuryContractId: string,
    pageOptions: PageOptions = PageOptions.DEFAULT,
  ) {
    super(pageOptions)
  }
}
