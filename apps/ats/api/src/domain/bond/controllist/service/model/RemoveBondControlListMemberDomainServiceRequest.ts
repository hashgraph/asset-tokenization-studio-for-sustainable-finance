// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"

export class RemoveBondControlListMemberDomainServiceRequest {
  @IsString()
  @IsNotEmpty()
  contractId: string

  @IsString()
  @IsNotEmpty()
  holderAccountId: string
}
