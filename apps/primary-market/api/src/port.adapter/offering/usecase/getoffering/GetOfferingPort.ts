// SPDX-License-Identifier: Apache-2.0

import { OfferingResponse } from "./model/OfferingResponse"

export abstract class GetOfferingPort {
  abstract execute(marketContractId: string, offeringDltId: string): Promise<OfferingResponse>
}
