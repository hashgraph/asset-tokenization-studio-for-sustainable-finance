import { GetTreasuryResponse } from "@port/treasury/usecase/gettreasury/model/GetTreasuryResponse"

export interface GetTreasuryPort {
  getTreasury(treasuryContractId: string): Promise<GetTreasuryResponse>
}
