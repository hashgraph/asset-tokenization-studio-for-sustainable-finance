import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, Min } from "class-validator"

export class PaymentToken extends BaseEntity {
  @IsNotEmpty()
  contractId: string

  @IsNotEmpty()
  treasuryId: string

  @IsNumber()
  @Min(0)
  decimals: number

  removalDate?: Date
}
