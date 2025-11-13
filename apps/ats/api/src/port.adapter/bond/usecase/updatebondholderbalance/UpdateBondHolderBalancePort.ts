// SPDX-License-Identifier: Apache-2.0
import { IssuedByPartitionDLTEvent } from "@port/bond/usecase/updatebondholderbalance/model/IssuedByPartitionDLTEvent"

export interface UpdateBondHolderBalancePort {
  handle(event: IssuedByPartitionDLTEvent): Promise<void>
}
