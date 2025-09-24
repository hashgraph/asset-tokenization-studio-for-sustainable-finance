// SPDX-License-Identifier: Apache-2.0

import { RabbitMQContainer, StartedRabbitMQContainer } from "@testcontainers/rabbitmq"
import * as amqp from "amqplib"

describe("Transaction Sender RabbitMQ Integration", () => {
  let rabbitMQContainer: StartedRabbitMQContainer
  let connection: any
  let channel: any
  let rabbitMQUri: string

  const TX_EXCHANGE = "tx"
  const HEDERA_QUEUE = "hederaFormat.incoming"
  const ETHEREUM_QUEUE = "ethereumFormat.incoming"
  const HEDERA_ROUTING_KEY = "hederaFormat.incoming"
  const ETHEREUM_ROUTING_KEY = "ethereumFormat.incoming"

  beforeAll(async () => {
    rabbitMQContainer = await new RabbitMQContainer("rabbitmq:3.12-management").withExposedPorts(5672, 15672).start()

    rabbitMQUri = rabbitMQContainer.getAmqpUrl()
    connection = await amqp.connect(rabbitMQUri)
    channel = await connection.createChannel()
  }, 60000)

  afterAll(async () => {
    if (channel) await channel.close()
    if (connection) await connection.close()
    if (rabbitMQContainer) {
      await rabbitMQContainer.stop()
    }
  })

  describe("Exchange and Queue Configuration", () => {
    it("should configure tx topic exchange correctly", async () => {
      await channel.assertExchange(TX_EXCHANGE, "topic", { durable: true })

      const exchangeInfo = await channel.checkExchange(TX_EXCHANGE)
      expect(exchangeInfo).toBeDefined()
    })

    it("should create and bind Hedera incoming queue", async () => {
      await channel.assertExchange(TX_EXCHANGE, "topic", { durable: true })
      await channel.assertQueue(HEDERA_QUEUE, { durable: true })
      await channel.bindQueue(HEDERA_QUEUE, TX_EXCHANGE, HEDERA_ROUTING_KEY)

      const queueInfo = await channel.checkQueue(HEDERA_QUEUE)
      expect(queueInfo).toBeDefined()
      expect(queueInfo.queue).toBe(HEDERA_QUEUE)
    })

    it("should create and bind Ethereum incoming queue", async () => {
      await channel.assertExchange(TX_EXCHANGE, "topic", { durable: true })
      await channel.assertQueue(ETHEREUM_QUEUE, { durable: true })
      await channel.bindQueue(ETHEREUM_QUEUE, TX_EXCHANGE, ETHEREUM_ROUTING_KEY)

      const queueInfo = await channel.checkQueue(ETHEREUM_QUEUE)
      expect(queueInfo).toBeDefined()
      expect(queueInfo.queue).toBe(ETHEREUM_QUEUE)
    })
  })

  describe("Hedera Transaction Messages", () => {
    beforeEach(async () => {
      await channel.assertExchange(TX_EXCHANGE, "topic", { durable: true })
      await channel.assertQueue(HEDERA_QUEUE, { durable: true })
      await channel.bindQueue(HEDERA_QUEUE, TX_EXCHANGE, HEDERA_ROUTING_KEY)
    })

    it("should handle valid Hedera transaction message", async () => {
      const hederaTransaction = {
        payload: "0x1234567890abcdef1234567890abcdef12345678",
        metadata: {
          origin: "evercity",
          description: "Bond creation transaction",
          requestId: "hedera-req-001",
        },
        format: "hedera",
      }

      const published = channel.publish(
        TX_EXCHANGE,
        HEDERA_ROUTING_KEY,
        Buffer.from(JSON.stringify(hederaTransaction)),
        { persistent: true, messageId: hederaTransaction.metadata.requestId },
      )

      expect(published).toBe(true)
      await new Promise((resolve) => setTimeout(resolve, 100))

      const receivedMessage = await channel.get(HEDERA_QUEUE, { noAck: true })
      expect(receivedMessage).not.toBe(false)

      if (receivedMessage !== false) {
        const parsedMessage = JSON.parse(receivedMessage.content.toString())
        expect(parsedMessage.payload).toBe(hederaTransaction.payload)
        expect(parsedMessage.format).toBe("hedera")
        expect(parsedMessage.metadata.origin).toBe("evercity")
        expect(parsedMessage.metadata.description).toBe("Bond creation transaction")
        expect(parsedMessage.metadata.requestId).toBe("hedera-req-001")
      }
    })

    it("should handle multiple Hedera transactions in sequence", async () => {
      const transactions = [
        {
          payload: "0xabc123def456789012345678901234567890abcd",
          metadata: { origin: "treasury", description: "Token transfer", requestId: "hedera-001" },
          format: "hedera",
        },
        {
          payload: "0xdef456abc789012345678901234567890123cdef",
          metadata: { origin: "ats", description: "Bond issuance", requestId: "hedera-002" },
          format: "hedera",
        },
        {
          payload: "0x789012345678901234567890abcdef123456789a",
          metadata: { origin: "primary-market", description: "Trade execution", requestId: "hedera-003" },
          format: "hedera",
        },
      ]

      for (const tx of transactions) {
        channel.publish(TX_EXCHANGE, HEDERA_ROUTING_KEY, Buffer.from(JSON.stringify(tx)), {
          persistent: true,
          messageId: tx.metadata.requestId,
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 200))

      const queueInfo = await channel.checkQueue(HEDERA_QUEUE)
      expect(queueInfo.messageCount).toBe(3)

      const receivedMessages: any[] = []
      for (let i = 0; i < 3; i++) {
        const msg = await channel.get(HEDERA_QUEUE, { noAck: true })
        if (msg !== false) {
          receivedMessages.push(JSON.parse(msg.content.toString()))
        }
      }

      expect(receivedMessages).toHaveLength(3)
      expect(receivedMessages.map((m) => m.metadata.requestId)).toEqual(["hedera-001", "hedera-002", "hedera-003"])
    })
  })

  describe("Ethereum Transaction Messages", () => {
    beforeEach(async () => {
      await channel.assertExchange(TX_EXCHANGE, "topic", { durable: true })
      await channel.assertQueue(ETHEREUM_QUEUE, { durable: true })
      await channel.bindQueue(ETHEREUM_QUEUE, TX_EXCHANGE, ETHEREUM_ROUTING_KEY)
    })

    it("should handle valid Ethereum transaction message", async () => {
      const ethereumTransaction = {
        payload: "0xabcdef1234567890abcdef1234567890abcdef12",
        metadata: {
          origin: "evercity",
          description: "Smart contract interaction",
          requestId: "ethereum-req-001",
        },
        format: "ethereum",
      }

      const published = channel.publish(
        TX_EXCHANGE,
        ETHEREUM_ROUTING_KEY,
        Buffer.from(JSON.stringify(ethereumTransaction)),
        { persistent: true, messageId: ethereumTransaction.metadata.requestId },
      )

      expect(published).toBe(true)
      await new Promise((resolve) => setTimeout(resolve, 100))

      const receivedMessage = await channel.get(ETHEREUM_QUEUE, { noAck: true })
      expect(receivedMessage).not.toBe(false)

      if (receivedMessage !== false) {
        const parsedMessage = JSON.parse(receivedMessage.content.toString())
        expect(parsedMessage.payload).toBe(ethereumTransaction.payload)
        expect(parsedMessage.format).toBe("ethereum")
        expect(parsedMessage.metadata.origin).toBe("evercity")
        expect(parsedMessage.metadata.description).toBe("Smart contract interaction")
        expect(parsedMessage.metadata.requestId).toBe("ethereum-req-001")
      }
    })
  })

  describe("Message Routing and Isolation", () => {
    beforeEach(async () => {
      await channel.assertExchange(TX_EXCHANGE, "topic", { durable: true })
      await channel.assertQueue(HEDERA_QUEUE, { durable: true })
      await channel.assertQueue(ETHEREUM_QUEUE, { durable: true })
      await channel.bindQueue(HEDERA_QUEUE, TX_EXCHANGE, HEDERA_ROUTING_KEY)
      await channel.bindQueue(ETHEREUM_QUEUE, TX_EXCHANGE, ETHEREUM_ROUTING_KEY)
    })

    it("should route messages to correct queues based on format", async () => {
      const hederaMessage = {
        payload: "0x1111111111111111111111111111111111111111",
        metadata: { origin: "test", description: "Hedera test", requestId: "hedera-routing-001" },
        format: "hedera",
      }

      const ethereumMessage = {
        payload: "0x2222222222222222222222222222222222222222",
        metadata: { origin: "test", description: "Ethereum test", requestId: "ethereum-routing-001" },
        format: "ethereum",
      }

      channel.publish(TX_EXCHANGE, HEDERA_ROUTING_KEY, Buffer.from(JSON.stringify(hederaMessage)))
      channel.publish(TX_EXCHANGE, ETHEREUM_ROUTING_KEY, Buffer.from(JSON.stringify(ethereumMessage)))

      await new Promise((resolve) => setTimeout(resolve, 100))

      const hederaQueueInfo = await channel.checkQueue(HEDERA_QUEUE)
      const ethereumQueueInfo = await channel.checkQueue(ETHEREUM_QUEUE)

      expect(hederaQueueInfo.messageCount).toBe(1)
      expect(ethereumQueueInfo.messageCount).toBe(1)

      const hederaMsg = await channel.get(HEDERA_QUEUE, { noAck: true })
      const ethereumMsg = await channel.get(ETHEREUM_QUEUE, { noAck: true })

      if (hederaMsg !== false && ethereumMsg !== false) {
        const parsedHedera = JSON.parse(hederaMsg.content.toString())
        const parsedEthereum = JSON.parse(ethereumMsg.content.toString())

        expect(parsedHedera.format).toBe("hedera")
        expect(parsedHedera.payload).toBe("0x1111111111111111111111111111111111111111")
        expect(parsedEthereum.format).toBe("ethereum")
        expect(parsedEthereum.payload).toBe("0x2222222222222222222222222222222222222222")
      }
    })
  })

  describe("Message Validation and Error Cases", () => {
    beforeEach(async () => {
      await channel.assertExchange(TX_EXCHANGE, "topic", { durable: true })
      await channel.assertQueue(HEDERA_QUEUE, { durable: true })
      await channel.bindQueue(HEDERA_QUEUE, TX_EXCHANGE, HEDERA_ROUTING_KEY)
    })

    it("should handle messages with missing metadata fields", async () => {
      const incompleteMessage = {
        payload: "0x1234567890abcdef1234567890abcdef12345678",
        metadata: {
          origin: "test",
        },
        format: "hedera",
      }

      channel.publish(TX_EXCHANGE, HEDERA_ROUTING_KEY, Buffer.from(JSON.stringify(incompleteMessage)))
      await new Promise((resolve) => setTimeout(resolve, 100))

      const msg = await channel.get(HEDERA_QUEUE, { noAck: true })
      expect(msg).not.toBe(false)

      if (msg !== false) {
        const parsed = JSON.parse(msg.content.toString())
        expect(parsed.metadata.origin).toBe("test")
        expect(parsed.metadata.description).toBeUndefined()
        expect(parsed.metadata.requestId).toBeUndefined()
      }
    })

    it("should handle messages with invalid JSON", async () => {
      const invalidJson = "{ invalid json content for transaction"
      channel.publish(TX_EXCHANGE, HEDERA_ROUTING_KEY, Buffer.from(invalidJson))

      await new Promise((resolve) => setTimeout(resolve, 100))

      const msg = await channel.get(HEDERA_QUEUE, { noAck: true })
      expect(msg).not.toBe(false)

      if (msg !== false) {
        expect(() => JSON.parse(msg.content.toString())).toThrow()
      }
    })

    it("should handle empty queue correctly", async () => {
      const result = await channel.get(HEDERA_QUEUE, { noAck: true })
      expect(result).toBe(false)
    })
  })

  describe("Container and Connection Verification", () => {
    it("should have RabbitMQ container running with correct ports", () => {
      expect(rabbitMQContainer.getHost()).toBeDefined()
      expect(rabbitMQContainer.getMappedPort(5672)).toBeGreaterThan(0)
      expect(rabbitMQContainer.getMappedPort(15672)).toBeGreaterThan(0)
    })

    it("should provide valid AMQP connection URI", () => {
      expect(rabbitMQUri).toMatch(/^amqp:\/\/.*:\d+$/)
      expect(connection).toBeDefined()
      expect(channel).toBeDefined()
    })

    it("should access management interface URL", () => {
      const managementUrl = `http://${rabbitMQContainer.getHost()}:${rabbitMQContainer.getMappedPort(15672)}`
      expect(managementUrl).toMatch(/^http:\/\/.*:\d+$/)
    })
  })
})
