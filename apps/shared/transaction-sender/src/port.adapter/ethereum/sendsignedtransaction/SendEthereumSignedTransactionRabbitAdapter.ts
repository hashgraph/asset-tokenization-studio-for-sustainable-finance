// SPDX-License-Identifier: Apache-2.0

import { Singleton, Logger, NestJSCommandBus } from "@hashgraph/green-bonds-shared-core"

import { SendEthereumSignedTransactionPort } from "./SendEthereumSignedTransactionPort"
import { SendSignedTransactionCommand } from "../../../app/command/sendsignedtransaction/SendSignedTransactionCommand"
import { SignedTransactionMessage } from "../../../domain/model/SignedTransactionMessage"
import { RabbitMQDecoratorFactory } from "../../../config/RabbitMQDecoratorFactory"

/**
 * RabbitMQ adapter for processing Ethereum signed transactions.
 * Implements the EthereumTransactionPort to handle Ethereum-specific message processing.
 * This adapter is responsible for:
 * - Receiving Ethereum transaction messages from RabbitMQ
 * - Validating and logging Ethereum transaction data
 * - Executing business commands for Ethereum transactions
 * - Handling Ethereum-specific error scenarios
 */
@Singleton()
export class SendEthereumSignedTransactionRabbitAdapter implements SendEthereumSignedTransactionPort {
  private readonly logger = new Logger(SendEthereumSignedTransactionRabbitAdapter.name)

  constructor(private readonly commandBus: NestJSCommandBus) {}

  @RabbitMQDecoratorFactory.createEthereumSubscribe()
  async onEthereumMessage(msg: SignedTransactionMessage): Promise<void> {
    const requestId = msg.metadata?.requestId || "unknown"
    const startTime = Date.now()

    this.logger.log("Received Ethereum transaction", {
      requestId: msg.metadata?.requestId,
      payloadLength: msg.payload?.length,
      blockchain: "ethereum",
    })

    try {
      const command = new SendSignedTransactionCommand(msg.payload, msg.metadata!, "ethereum")
      await this.commandBus.execute(command)

      const duration = Date.now() - startTime
      this.logger.log(`Successfully processed Ethereum transaction with requestId: ${requestId}`, {
        requestId,
        format: "ethereum",
        duration,
        blockchain: "ethereum",
      })
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      const errorStack = error instanceof Error ? error.stack : undefined

      this.logger.error(`Failed to process Ethereum transaction with requestId: ${requestId}. Error: ${errorMessage}`, {
        requestId,
        format: "ethereum",
        duration,
        error: errorStack,
        blockchain: "ethereum",
      })
      throw error
    }
  }
}
