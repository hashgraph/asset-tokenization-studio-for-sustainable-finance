import { Test } from "@nestjs/testing"
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq"
import { INestApplication } from "@nestjs/common"
import { RabbitMQEventPublisherAdapter } from "@port/eventpublisher/RabbitMQEventPublisherAdapter"
import * as amqp from "amqplib"
import { GenericContainer } from "testcontainers"
import { EventEmitterModule, EventEmitter2 } from "@nestjs/event-emitter"
import { PublishEventPortNestJSEventAdapter } from "@port/event/usecase/publishevent/PublishEventPortNestJSEventAdapter"

jest.setTimeout(30000)

describe("RabbitMQ publish via EventEmitter e2e (enabled)", () => {
  let app: INestApplication
  let container: any

  beforeAll(async () => {
    container = await new GenericContainer("rabbitmq:3.13").withExposedPorts(5672).start()
    const host = container.getHost()
    const port = container.getMappedPort(5672)
    const uri = `amqp://${host}:${port}`
    process.env.RABBITMQ_URI = uri
    process.env.RABBITMQ_EXCHANGE_NAME = "greenbond.events"
    process.env.RABBITMQ_PUBLISH_ENABLED = "true"
    process.env.RABBITMQ_BLOCKCHAIN_ROUTING_KEY = "blockchain.events"

    const moduleRef = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot({ wildcard: true }),
        RabbitMQModule.forRoot({
          uri,
          exchanges: [{ name: "greenbond.events", type: "topic" }],
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
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
    if (container) {
      await container.stop()
    }
  })

  it("emits RoleGrantedDLTEvent and receives message under RoleGranted routing key", async () => {
    const eventBus = app.get(EventEmitter2)
    class RoleGrantedDLTEvent {}

    const conn = await amqp.connect(process.env.RABBITMQ_URI)
    const channel = await (conn as any).createChannel()
    await channel.assertExchange("greenbond.events", "topic", { durable: true })
    const q = await channel.assertQueue("", { exclusive: true })
    await channel.bindQueue(q.queue, "greenbond.events", "blockchain.events.RoleGranted")

    const received = new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new Error("Timeout esperando mensaje")), 10000)
      channel.consume(
        q.queue,
        (msg: any) => {
          try {
            const data = JSON.parse(msg.content.toString())
            if (data.eventName === "RoleGranted") {
              clearTimeout(to)
              resolve(true)
            }
          } catch {}
        },
        { noAck: true },
      )
    })

    eventBus.emit("RoleGrantedDLTEvent", new RoleGrantedDLTEvent() as any)
    await new Promise((r) => setTimeout(r, 100))
    await received
    await channel.close()
    await (conn as any).close()
  })
})

describe("RabbitMQ publish via EventEmitter e2e (disabled)", () => {
  let app: INestApplication
  let container: any

  beforeAll(async () => {
    container = await new GenericContainer("rabbitmq:3.13").withExposedPorts(5672).start()
    const host = container.getHost()
    const port = container.getMappedPort(5672)
    const uri = `amqp://${host}:${port}`
    process.env.RABBITMQ_URI = uri
    process.env.RABBITMQ_EXCHANGE_NAME = "greenbond.events"
    process.env.RABBITMQ_PUBLISH_ENABLED = "false"
    process.env.RABBITMQ_BLOCKCHAIN_ROUTING_KEY = "blockchain.events"

    const moduleRef = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot({ wildcard: true }),
        RabbitMQModule.forRoot({
          uri,
          exchanges: [{ name: "greenbond.events", type: "topic" }],
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
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
    if (container) {
      await container.stop()
    }
  })

  it("does not publish when RABBITMQ_PUBLISH_ENABLED=false", async () => {
    const eventBus = app.get(EventEmitter2)
    class RoleGrantedDLTEvent {}

    const conn = await amqp.connect(process.env.RABBITMQ_URI)
    const channel = await (conn as any).createChannel()
    await channel.assertExchange("greenbond.events", "topic", { durable: true })
    const q = await channel.assertQueue("", { exclusive: true })
    await channel.bindQueue(q.queue, "greenbond.events", "blockchain.events.RoleGranted")

    const received: Promise<boolean> = new Promise((resolve) => {
      const to = setTimeout(() => resolve(false), 1500)
      channel.consume(
        q.queue,
        (msg: any) => {
          clearTimeout(to)
          resolve(true)
        },
        { noAck: true },
      )
    })

    eventBus.emit("RoleGrantedDLTEvent", new RoleGrantedDLTEvent() as any)
    await expect(received).resolves.toBe(false)
    await channel.close()
    await (conn as any).close()
  })
})
