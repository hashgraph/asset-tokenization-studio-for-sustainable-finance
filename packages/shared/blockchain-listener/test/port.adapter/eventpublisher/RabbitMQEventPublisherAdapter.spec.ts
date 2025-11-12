import { Test } from "@nestjs/testing"
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq"
import { INestApplication } from "@nestjs/common"
import { RabbitMQEventPublisherAdapter } from "@port/eventpublisher/RabbitMQEventPublisherAdapter"
import * as amqp from "amqplib"
import { GenericContainer } from "testcontainers"

jest.setTimeout(30000)

describe("RabbitMQ publish e2e", () => {
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
        RabbitMQModule.forRoot({
          uri,
          exchanges: [{ name: "greenbond.events", type: "topic" }],
        }),
      ],
      providers: [RabbitMQEventPublisherAdapter],
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

  it("publish and receive event with composite routing key", async () => {
    const adapter = app.get(RabbitMQEventPublisherAdapter)
    class RoleGranted {}

    const conn = await amqp.connect(process.env.RABBITMQ_URI)
    const channel = await (conn as any).createChannel()
    await channel.assertExchange("greenbond.events", "topic", { durable: true })
    const q = await channel.assertQueue("", { exclusive: true })
    await channel.bindQueue(q.queue, "greenbond.events", "blockchain.events.RoleGranted")

    const received = new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new Error("Timeout esperando mensaje")), 5000)
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

    await adapter.publish(new RoleGranted() as any)
    await received
    await channel.close()
    await (conn as any).close()
  })
})
