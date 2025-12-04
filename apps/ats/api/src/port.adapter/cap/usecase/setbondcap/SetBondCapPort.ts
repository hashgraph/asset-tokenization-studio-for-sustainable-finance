// SPDX-License-Identifier: Apache-2.0
import { MaxSupplySetDLTEvent } from "@port/cap/usecase/setbondcap/model/MaxSupplySetDLTEvent"

export interface SetBondCapPort {
  handle(event: MaxSupplySetDLTEvent): Promise<void>
}
