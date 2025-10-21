// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsOptional, IsString } from "class-validator"
export class AddPaymentTokenTransferAppServiceRequest {
  @IsString()
  @IsNotEmpty()
  paymentTokenContractId: string

  @IsString()
  @IsNotEmpty()
  fromAccountId: string

  @IsString()
  @IsNotEmpty()
  toAccountId: string

  @IsString()
  @IsOptional()
  amount?: string
}
