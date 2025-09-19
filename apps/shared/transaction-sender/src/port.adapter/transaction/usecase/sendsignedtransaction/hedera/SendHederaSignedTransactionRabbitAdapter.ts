// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@hashgraph/green-bonds-shared-core"
import { NestJSCommandBus } from "@hashgraph/green-bonds-shared-core"
import { SendHederaSignedTransactionPort } from "../../sendsignedtransaction/hedera/SendHederaSignedTransactionPort"
import { SendSignedTransactionCommand } from "../../../../../app/command/sendsignedtransaction/SendSignedTransactionCommand"
import { SignedTransactionMessage } from "../../../../../domain/model/SignedTransactionMessage"
import { RabbitMQDecoratorFactory } from "../../../../../config/RabbitMQDecoratorFactory"

@Singleton()
export class SendHederaSignedTransactionRabbitAdapter implements SendHederaSignedTransactionPort {
  constructor(private readonly commandBus: NestJSCommandBus) {}

  @RabbitMQDecoratorFactory.createHederaSubscribe()
  async onHederaMessage(msg: SignedTransactionMessage): Promise<void> {
    const command = new SendSignedTransactionCommand(msg.payload, msg.metadata!, "hedera")
    await this.commandBus.execute(command)
  }
}
