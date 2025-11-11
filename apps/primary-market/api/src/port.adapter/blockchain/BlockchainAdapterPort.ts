// SPDX-License-Identifier: Apache-2.0

import { OfferingStatus } from "@domain/offering/model/OfferingStatus"

export interface BlockchainAdapterPort {
  getOfferingStatus(contractId: string, offeringId: number): Promise<OfferingStatus>
}
