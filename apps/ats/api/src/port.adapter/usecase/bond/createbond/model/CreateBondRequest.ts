// SPDX-License-Identifier: Apache-2.0
import { IsString, IsNotEmpty, IsIn } from 'class-validator'

export class CreateBondRequest {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsString()
  @IsNotEmpty()
  symbol: string

  @IsIn(['hedera', 'ethereum'])
  format: string
}
