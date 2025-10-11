import { BondDeployedDLTEvent } from "@port/bond/usecase/createbond/model/BondDeployedDLTEvent"

export interface CreateBondPort {
  handle(event: BondDeployedDLTEvent): Promise<void>
}
