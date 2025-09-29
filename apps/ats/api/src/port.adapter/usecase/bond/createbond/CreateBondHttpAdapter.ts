// SPDX-License-Identifier: Apache-2.0
import { RestController, Inject, Logger } from '@hashgraph/green-bonds-shared-core'
import type { CommandBus } from '@hashgraph/green-bonds-shared-core'
import { CreateBondCommand } from '@app/bond/createbond/command/CreateBondCommnad'
import { CreateBondPort } from './CreateBondPort'
import { CreateBondRequest } from './model/CreateBondRequest'
import { CreateBondResponse } from './model/CreateBondResponse'
import { Body, Post } from '@nestjs/common'
import { CreateBondCommandResponse } from '@domain/bond/model/CreateBondCommandResponse'

@RestController('/bonds')
export class CreateBondHttpAdapter implements CreateBondPort {
  private readonly logger = new Logger(CreateBondHttpAdapter.name)
  constructor(@Inject() private readonly commandBus: CommandBus) {}
  @Post()
  async createBond(@Body() bond: CreateBondRequest): Promise<CreateBondResponse> {
    this.logger.log('POST /bonds called with:', bond)
    const command = new CreateBondCommand(bond.name, bond.description, bond.symbol, bond.format)
    const createBondCommandResponse = await this.commandBus.execute<CreateBondCommand, CreateBondCommandResponse>(
      command,
    )
    const createBondResponse = new CreateBondResponse(createBondCommandResponse.unsignedTx)
    this.logger.log(createBondResponse)
    return createBondResponse
  }
}
