import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty } from "class-validator"

export class PaymentToken extends BaseEntity {
  @IsNotEmpty()
  contractId: string

  @IsNotEmpty()
  treasuryId: string

  @IsNotEmpty()
  balance: string

  validityDate?: Date
}
