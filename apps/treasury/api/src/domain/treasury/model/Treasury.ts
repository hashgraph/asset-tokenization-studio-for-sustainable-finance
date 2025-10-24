import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, ValidateNested, IsDefined } from "class-validator"
import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import { Type } from "class-transformer"
import { TreasuryAlreadyPausedError } from "@domain/treasury/errors/TreasuryAlreadyPausedError"
import { TreasuryAlreadyUnpausedError } from "@domain/treasury/errors/TreasuryAlreadyUnpausedError"

export class Treasury extends BaseEntity {
  @IsNotEmpty()
  contractId: string

  @IsNotEmpty()
  bondContractId: string

  @ValidateNested()
  @Type(() => PaymentToken)
  paymentToken?: PaymentToken

  @IsDefined()
  paused: boolean = false

  pause(): void {
    if (this.paused) {
      throw TreasuryAlreadyPausedError.forTreasury(this.contractId)
    }
    this.paused = true
  }

  unpause(): void {
    if (!this.paused) {
      throw TreasuryAlreadyUnpausedError.forTreasury(this.contractId)
    }
    this.paused = false
  }
}
