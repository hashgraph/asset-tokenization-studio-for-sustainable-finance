// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsIn } from 'class-validator'
import { Command } from '@hashgraph/green-bonds-shared-core'
import { CreateBondCommandResponse } from '@domain/bond/model/CreateBondCommandResponse'

export class CreateBondCommand extends Command<CreateBondCommandResponse> {
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

  constructor(name: string, description: string, symbol: string, format: string) {
    super()
    this.name = name
    this.description = description
    this.symbol = symbol
    this.format = format
  }
}
