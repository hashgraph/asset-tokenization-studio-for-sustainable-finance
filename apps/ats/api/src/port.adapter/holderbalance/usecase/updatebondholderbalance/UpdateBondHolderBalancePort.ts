// SPDX-License-Identifier: Apache-2.0
import { IssuedByPartitionDLTEvent } from "@port/holderbalance/usecase/updatebondholderbalance/model/IssuedByPartitionDLTEvent"

export interface UpdateBondHolderBalancePort {
  handle(event: IssuedByPartitionDLTEvent): Promise<void>
}
