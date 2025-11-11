// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"

export class AddBondControlListMemberDomainServiceRequest {
  @IsString()
  @IsNotEmpty()
  contractId: string

  @IsString()
  @IsNotEmpty()
  holderId: string
}
