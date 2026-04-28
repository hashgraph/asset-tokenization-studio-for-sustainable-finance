import { Test } from "@nestjs/testing"
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq"
import { INestApplication } from "@nestjs/common"
import { RabbitMQEventPublisherAdapter } from "@port/eventpublisher/RabbitMQEventPublisherAdapter"
import * as amqp from "amqplib"
import { RabbitMQContainer, StartedRabbitMQContainer } from "@testcontainers/rabbitmq"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { PublishEventPortNestJSEventAdapter } from "@port/event/usecase/publishevent/PublishEventPortNestJSEventAdapter"
import { SharedModule, RoleGrantedDLTEvent } from "@hashgraph/green-bonds-shared-core"

describe("RabbitMQ publish via EventEmitter e2e (enabled)", () => {
  let app: INestApplication
  let container: StartedRabbitMQContainer

  beforeAll(async () => {
    // Configure testcontainers for CI environments
    // Disable ryuk in CI to avoid image pull issues
    if (process.env.CI === "true") {
      process.env.TESTCONTAINERS_RYUK_DISABLED = "true"
    }

    container = await new RabbitMQContainer("rabbitmq:3.13").withExposedPorts(5672).start()
    const uri = container.getAmqpUrl()
    process.env.RABBITMQ_URI = uri
    process.env.RABBITMQ_EXCHANGE_NAME = "greenbond.events"
    process.env.RABBITMQ_PUBLISH_ENABLED = "true"
    process.env.RABBITMQ_BLOCKCHAIN_ROUTING_KEY = "blockchain.events"

    const moduleRef = await Test.createTestingModule({
      imports: [
        SharedModule,
        RabbitMQModule.forRoot({
          uri,
          connectionInitOptions: { wait: true },
          exchanges: [{ name: "greenbond.events", type: "topic", options: { durable: true } }],
        }),
      ],
      providers: [
        PublishEventPortNestJSEventAdapter,
        RabbitMQEventPublisherAdapter,
        {
          provide: "EventPublisherPort",
          useClass: RabbitMQEventPublisherAdapter,
        },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
    await new Promise((r) => setTimeout(r, 2000))
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
    if (container) await container.stop()
  })

  it("emits RoleGrantedDLTEvent and receives message under RoleGranted routing key", async () => {
    const eventBus: EventBus = app.get("EventBus")

    const conn = await amqp.connect(process.env.RABBITMQ_URI)
    const channel = await (conn as any).createChannel()
    const q = await channel.assertQueue("", { exclusive: true })
    await channel.bindQueue(q.queue, "greenbond.events", "blockchain.events.RoleGranted")
    await new Promise((r) => setTimeout(r, 200))

    const eventPublisher: any = app.get("EventPublisherPort")
    const publishSpy = jest.spyOn(eventPublisher, "publish")
    const received: Promise<any> = new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new Error("Timeout waiting for message")), 20000)
      channel.consume(
        q.queue,
        (msg: any) => {
          const data = JSON.parse(msg.content.toString())
          if (data.eventName === "RoleGranted") {
            clearTimeout(to)
            resolve(data)
          }
        },
        { noAck: true },
      )
    })

    await eventBus.publishSync(
      new RoleGrantedDLTEvent("0.0.123", "0xdeadbeef", "0xop", "0xacc", "0xrole") as any,
      `${RoleGrantedDLTEvent.name}.DLTEvent`,
    )
    await new Promise((r) => setTimeout(r, 200))
    expect(publishSpy).toHaveBeenCalled()
    await expect(received).resolves.toEqual({
      eventName: "RoleGranted",
      contractId: "0.0.123",
      transactionHash: "0xdeadbeef",
      operator: "0xop",
      account: "0xacc",
      role: "0xrole",
      timestamp: expect.any(Number),
    })
    await channel.close()
    await (conn as any).close()
  })
})

describe("RabbitMQ publish via EventEmitter e2e (disabled)", () => {
  let app: INestApplication
  let container: any

  beforeAll(async () => {
    // Configure testcontainers for CI environments
    // Disable ryuk in CI to avoid image pull issues
    if (process.env.CI === "true") {
      process.env.TESTCONTAINERS_RYUK_DISABLED = "true"
    }

    container = await new RabbitMQContainer("rabbitmq:3.13").withExposedPorts(5672).start()
    const uri = container.getAmqpUrl()
    process.env.RABBITMQ_URI = uri
    process.env.RABBITMQ_EXCHANGE_NAME = "greenbond.events"
    process.env.RABBITMQ_PUBLISH_ENABLED = "false"
    process.env.RABBITMQ_BLOCKCHAIN_ROUTING_KEY = "blockchain.events"

    const moduleRef = await Test.createTestingModule({
      imports: [
        SharedModule,
        RabbitMQModule.forRoot({
          uri,
          connectionInitOptions: { wait: true },
          exchanges: [{ name: "greenbond.events", type: "topic", options: { durable: true } }],
        }),
      ],
      providers: [
        PublishEventPortNestJSEventAdapter,
        RabbitMQEventPublisherAdapter,
        {
          provide: "EventPublisherPort",
          useClass: RabbitMQEventPublisherAdapter,
        },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
    await new Promise((r) => setTimeout(r, 2000))
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
    if (container) await container.stop()
  })

  it("does not publish when RABBITMQ_PUBLISH_ENABLED=false", async () => {
    const eventBus: EventBus = app.get("EventBus")

    const conn = await amqp.connect(process.env.RABBITMQ_URI)
    ;(conn as any).on("error", () => {})
    ;(conn as any).on("close", () => {})
    const channel = await (conn as any).createChannel()
    const q = await channel.assertQueue("", { exclusive: true })
    await channel.bindQueue(q.queue, "greenbond.events", "blockchain.events.RoleGranted")

    const received: Promise<boolean> = new Promise((resolve) => {
      const to = setTimeout(() => resolve(false), 1500)
      channel.consume(
        q.queue,
        () => {
          clearTimeout(to)
          resolve(true)
        },
        { noAck: true },
      )
    })

    await eventBus.publishSync(
      new RoleGrantedDLTEvent("0.0.123", "0xdeadbeef", "0xop", "0xacc", "0xrole") as any,
      `${RoleGrantedDLTEvent.name}.DLTEvent`,
    )
    await expect(received).resolves.toBe(false)
    await channel.close()
    await (conn as any).close()
  })
})
