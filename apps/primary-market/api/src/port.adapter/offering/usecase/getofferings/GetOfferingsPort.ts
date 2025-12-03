// SPDX-License-Identifier: Apache-2.0

import { PageResponse } from "@hashgraph/green-bonds-shared-core"
import { OfferingResponse } from "@port/shared/model/OfferingResponse"

export interface GetOfferingsPort {
  getOfferings(marketContractId: string, pageOptionsRequest: any): Promise<PageResponse<OfferingResponse>>
}
