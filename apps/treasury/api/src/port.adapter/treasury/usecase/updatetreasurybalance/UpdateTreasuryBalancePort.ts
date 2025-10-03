import { TransferDLTEvent } from "@port/treasury/usecase/updatetreasurybalance/model/TransferDLTEvent"

export interface UpdateTreasuryBalancePort {
  handle(event: TransferDLTEvent): Promise<void>
}
