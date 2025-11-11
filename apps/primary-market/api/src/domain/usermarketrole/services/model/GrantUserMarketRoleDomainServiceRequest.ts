// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"

export class GrantUserMarketRoleDomainServiceRequest {
  @IsNotEmpty()
  @IsString()
  accountId: string

  @IsNotEmpty()
  @IsString()
  roleHex: string

  @IsNotEmpty()
  @IsString()
  marketContractId: string
}
