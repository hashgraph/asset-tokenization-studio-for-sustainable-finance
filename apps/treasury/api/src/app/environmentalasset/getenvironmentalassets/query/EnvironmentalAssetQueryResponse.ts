// SPDX-License-Identifier: Apache-2.0

import { QueryPageResponse } from "@hashgraph/green-bonds-shared-core"

export class EnvironmentalAssetQueryResponse extends QueryPageResponse<{
  contractId: string
  validityDate: Date | null
}> {}
