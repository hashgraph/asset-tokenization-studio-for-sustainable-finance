// SPDX-License-Identifier: Apache-2.0
import { MaxSupplySetDLTEvent } from "@port/bond/usecase/setbondcap/model/MaxSupplySetDLTEvent"

export interface SetBondCapPort {
  handle(event: MaxSupplySetDLTEvent): Promise<void>
}
