import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, ValidateNested, IsDefined } from "class-validator"
import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import { Type } from "class-transformer"

export class Treasury extends BaseEntity {
  @IsNotEmpty()
  contractId: string

  @IsNotEmpty()
  bondContractId: string

  @ValidateNested()
  @Type(() => PaymentToken)
  paymentToken: PaymentToken

  @IsDefined()
  paused: boolean = false
}
