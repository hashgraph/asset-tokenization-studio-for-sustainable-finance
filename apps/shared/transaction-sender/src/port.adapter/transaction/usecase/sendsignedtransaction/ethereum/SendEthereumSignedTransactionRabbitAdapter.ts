// SPDX-License-Identifier: Apache-2.0

import { NestJSCommandBus, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SendEthereumSignedTransactionPort } from "../../sendsignedtransaction/ethereum/SendEthereumSignedTransactionPort"
import { SendSignedTransactionCommand } from "../../../../../app/command/sendsignedtransaction/SendSignedTransactionCommand"
import { SignedTransactionMessage } from "../../../../../domain/model/SignedTransactionMessage"
import { RabbitMQDecoratorFactory } from "../../../../../config/RabbitMQDecoratorFactory"

@Singleton()
export class SendEthereumSignedTransactionRabbitAdapter implements SendEthereumSignedTransactionPort {
  constructor(private readonly commandBus: NestJSCommandBus) {}

  @RabbitMQDecoratorFactory.createEthereumSubscribe()
  async onEthereumMessage(msg: SignedTransactionMessage): Promise<void> {
    const command = new SendSignedTransactionCommand(msg.payload, msg.metadata!, "ethereum")
    await this.commandBus.execute(command)
  }
}
