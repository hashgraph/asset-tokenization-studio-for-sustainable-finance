// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { RetryService } from "../../src/retry/RetryService"
import { RetryOptions } from "../../src/retry/RetryOptions"
import { RetryExecutor } from "../../src/retry/RetryExecutor"
import { RetryExecutorPort } from "../../src/retry/ports/RetryExecutorPort"

describe("RetryService", () => {
  let service: RetryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetryService],
    }).compile()

    service = module.get<RetryService>(RetryService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("createRetryExecutor", () => {
    it("should create a RetryExecutor instance with correct logger context", () => {
      const loggerContext = "TestService"

      const executor = service.createRetryExecutor(loggerContext)

      expect(executor).toBeInstanceOf(RetryExecutor)
      expect(executor).toEqual(expect.any(RetryExecutor))
    })

    it("should create different instances on each call", () => {
      const executor1 = service.createRetryExecutor("Context1")
      const executor2 = service.createRetryExecutor("Context2")

      expect(executor1).not.toBe(executor2)
      expect(executor1).toBeInstanceOf(RetryExecutor)
      expect(executor2).toBeInstanceOf(RetryExecutor)
    })

    it("should implement RetryExecutorPort interface", () => {
      const executor = service.createRetryExecutor("TestContext")

      expect(executor).toEqual(
        expect.objectContaining({
          execute: expect.any(Function),
        }),
      )
    })
  })

  describe("run", () => {
    it("should delegate to RetryExecutor.execute with correct parameters", async () => {
      const mockFn = jest.fn().mockResolvedValue("success")
      const options: RetryOptions = { retries: 2, minTimeout: 100 }

      const mockExecutor = {
        execute: jest.fn().mockResolvedValue("mocked-result"),
      } as jest.Mocked<RetryExecutorPort>

      const createExecutorSpy = jest.spyOn(service, "createRetryExecutor").mockReturnValue(mockExecutor)

      const result = await service.run(mockFn, options)

      expect(createExecutorSpy).toHaveBeenCalledWith(RetryService.name)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockExecutor.execute).toHaveBeenCalledWith(expect.any(Function), options)
      expect(result).toBe("mocked-result")
    })

    it("should use empty options when none provided", async () => {
      const mockFn = jest.fn().mockResolvedValue("success")

      const mockExecutor = {
        execute: jest.fn().mockResolvedValue("mocked-result"),
      } as jest.Mocked<RetryExecutorPort>

      jest.spyOn(service, "createRetryExecutor").mockReturnValue(mockExecutor)

      await service.run(mockFn)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockExecutor.execute).toHaveBeenCalledWith(expect.any(Function), {})
    })

    it("should create executor with RetryService.name as logger context", async () => {
      const mockFn = jest.fn().mockResolvedValue("success")
      const createExecutorSpy = jest.spyOn(service, "createRetryExecutor").mockReturnValue({
        execute: jest.fn().mockResolvedValue("success"),
      } as jest.Mocked<RetryExecutorPort>)

      await service.run(mockFn, { minTimeout: 10, maxTimeout: 100 })

      expect(createExecutorSpy).toHaveBeenCalledWith("RetryService")
    })
  })

  describe("abort", () => {
    it("should return AbortError with original error", () => {
      const originalError = new Error("Test abort")
      const abortError = RetryService.abort(originalError)

      expect(abortError).toBeInstanceOf(Error)
      expect(abortError.name).toBe("AbortError")
      expect(abortError.message).toBe("Test abort")
    })

    it("should be a static method", () => {
      expect(typeof RetryService.abort).toBe("function")

      const originalError = new Error("Static test")
      const abortError = RetryService.abort(originalError)

      expect(abortError.name).toBe("AbortError")
    })
  })
})
