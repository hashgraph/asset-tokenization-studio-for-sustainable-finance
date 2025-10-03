import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsHexadecimal, IsNotEmpty } from "class-validator"

export class Treasury extends BaseEntity {
  @IsNotEmpty()
  @IsHexadecimal()
  contractAddress: string

  @IsNotEmpty()
  @IsHexadecimal()
  bondContractAddress: string

  @IsNotEmpty()
  balance: string
}
