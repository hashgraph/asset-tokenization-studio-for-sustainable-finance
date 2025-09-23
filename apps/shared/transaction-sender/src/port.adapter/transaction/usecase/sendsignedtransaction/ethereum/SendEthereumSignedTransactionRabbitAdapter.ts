// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { SendEthereumSignedTransactionPort } from "../../sendsignedtransaction/ethereum/SendEthereumSignedTransactionPort"
import { SendSignedTransactionCommand } from "@app/sendsignedtransaction/command/SendSignedTransactionCommand"
import { SignedTransactionRequest } from "@domain/model/SignedTransactionRequest"
import { RabbitMQDecoratorFactory } from "../../../../../config/RabbitMQDecoratorFactory"

@Singleton()
export class SendEthereumSignedTransactionRabbitAdapter implements SendEthereumSignedTransactionPort {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @RabbitMQDecoratorFactory.createEthereumSubscribe()
  async onEthereumMessage(msg: SignedTransactionRequest): Promise<void> {
    const command = new SendSignedTransactionCommand(msg.payload, msg.metadata, "ethereum")
    await this.commandBus.execute(command)
  }
}
