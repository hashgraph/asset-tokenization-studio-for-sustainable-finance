import { IsNotEmpty } from "class-validator"

export class GetTreasuryAppServiceRequest {
  @IsNotEmpty()
  readonly treasuryContractId: string
}
