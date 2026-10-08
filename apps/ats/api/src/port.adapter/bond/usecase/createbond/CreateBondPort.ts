import { BondSuiteDeployedDLTEvent } from "@port/bond/usecase/createbond/model/BondSuiteDeployedDLTEvent"

export interface CreateBondPort {
  handle(event: BondSuiteDeployedDLTEvent): Promise<void>
}
