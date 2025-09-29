// SPDX-License-Identifier: Apache-2.0
import { CommandHandler, Handler, Inject, Logger, Singleton, Validate } from '@hashgraph/green-bonds-shared-core'
import type { EventBus } from '@hashgraph/green-bonds-shared-core'
import { CreateBondCommand } from './CreateBondCommnad'
import { CreatedBondTxEvent } from '@domain/bond/events/CreatedBondTxEvent'
import { CreateBondCommandResponse } from '@domain/bond/model/CreateBondCommandResponse'

@Singleton()
@Handler(CreateBondCommand)
export class CreateBondCommandHandler implements CommandHandler<CreateBondCommand, CreateBondCommandResponse> {
  private readonly logger = new Logger(CreateBondCommandHandler.name)

  constructor(@Inject() private readonly eventBus: EventBus) {}

  @Validate()
  async execute(command: CreateBondCommand): Promise<CreateBondCommandResponse> {
    const createBondCommandResponse = new CreateBondCommandResponse(await Promise.resolve('unsignedTxPlaceholder')) // Here you would create the actual bond and get the unsigned transaction
    this.logger.log(command)
    const event = new CreatedBondTxEvent(
      command.name,
      command.description,
      command.format,
      command.symbol,
      createBondCommandResponse.unsignedTx,
    )
    this.eventBus.publish(event)
    return createBondCommandResponse
  }
}
