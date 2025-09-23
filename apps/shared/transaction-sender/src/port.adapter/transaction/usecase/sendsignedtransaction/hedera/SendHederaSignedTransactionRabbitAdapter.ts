// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { SendHederaSignedTransactionPort } from "../../sendsignedtransaction/hedera/SendHederaSignedTransactionPort"
import { SendSignedTransactionCommand } from "@app/command/sendsignedtransaction/SendSignedTransactionCommand"
import { SignedTransactionMessage } from "@domain/model/SignedTransactionMessage"
import { RabbitMQDecoratorFactory } from "../../../../../config/RabbitMQDecoratorFactory"

@Singleton()
export class SendHederaSignedTransactionRabbitAdapter implements SendHederaSignedTransactionPort {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @RabbitMQDecoratorFactory.createHederaSubscribe()
  async onHederaMessage(msg: SignedTransactionMessage): Promise<void> {
    const command = new SendSignedTransactionCommand(msg.payload, msg.metadata, "hedera")
    await this.commandBus.execute(command)
  }
}
