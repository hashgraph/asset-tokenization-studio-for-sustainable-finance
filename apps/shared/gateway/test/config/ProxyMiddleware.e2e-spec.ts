import { Test, TestingModule } from "@nestjs/testing"
import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
} from "@nestjs/common"
import request from "supertest"
import { App } from "supertest/types"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { ProxyMiddleware } from "../../src/config/ProxyMiddleware"

describe("ProxyMiddleware", () => {
  let app: INestApplication<App>
  const originalEnv = process.env

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    await app.listen()
    const url = await app.getUrl()
    const port = url.substring(url.lastIndexOf(":") + 1)
    process.env.PATHS = "/api/v1/treasury"
    process.env.ROUTES = `http://localhost:${port}/exclude`
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("should return 404 HTTP error if path is not configured", async () => {
    const response = await request(app.getHttpServer()).get("/api/v1/invalid-path").expect(HttpStatus.NOT_FOUND)

    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Cannot GET /api/v1/invalid-path",
        error: "Not Found",
        statusCode: HttpStatus.NOT_FOUND,
      }),
    )
  })

  it("should proxy request properly if path is configured", async () => {
    const response = await request(app.getHttpServer()).get("/api/v1/treasury/test").expect(HttpStatus.OK)

    expect(response.body).toEqual(
      expect.objectContaining({
        testController: "test response",
      }),
    )
  })

  it("should return same HTTP error than proxied response", async () => {
    const response = await request(app.getHttpServer()).get("/api/v1/treasury/error").expect(HttpStatus.BAD_REQUEST)

    expect(response.body).toEqual(
      expect.objectContaining({
        message: "test error",
        error: "Bad Request",
        statusCode: HttpStatus.BAD_REQUEST,
      }),
    )
  })
})

@Controller("/exclude/api/v1/treasury")
class TestController {
  @Get("test")
  test() {
    return {
      testController: "test response",
    }
  }

  @Get("error")
  error() {
    throw new BadRequestException("test error")
  }
}

@Module({
  imports: [SharedModule],
  controllers: [TestController],
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProxyMiddleware).exclude("/exclude/*").forRoutes("*")
  }
}
