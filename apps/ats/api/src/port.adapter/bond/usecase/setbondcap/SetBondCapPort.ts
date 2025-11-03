import { MaxSupplySetDLTEvent } from "@port/bond/usecase/setbondcap/model/MaxSupplySetDLTEvent"

export interface SetBondCapPort {
  handle(event: MaxSupplySetDLTEvent): Promise<void>
}
