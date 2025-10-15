import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsEnum, IsNotEmpty, IsNumberString } from "class-validator"
import { TransferType } from "./TransferType"

export class PaymentTokenTransfer extends BaseEntity {
  @IsNotEmpty()
  contractId: string

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  amount: string

  @IsNotEmpty()
  paymentTokenId: string

  @IsNotEmpty()
  @IsEnum(TransferType)
  type: TransferType
}
