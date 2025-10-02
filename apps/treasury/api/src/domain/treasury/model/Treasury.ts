import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNumber, IsHexadecimal, IsNotEmpty, Min } from "class-validator"

export class Treasury extends BaseEntity {
  @IsNotEmpty()
  @IsHexadecimal()
  contractAddress: string

  @IsNotEmpty()
  @IsHexadecimal()
  bondContractAddress: string

  @Min(0)
  @IsNumber()
  balance: number
}
