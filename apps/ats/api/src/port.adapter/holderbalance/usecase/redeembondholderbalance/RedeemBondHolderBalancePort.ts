// SPDX-License-Identifier: Apache-2.0
import { RedeemedByPartitionDLTEvent } from "./model/RedeemedByPartitionDLTEvent"

export interface RedeemBondHolderBalancePort {
  handle(event: RedeemedByPartitionDLTEvent): Promise<void>
}
