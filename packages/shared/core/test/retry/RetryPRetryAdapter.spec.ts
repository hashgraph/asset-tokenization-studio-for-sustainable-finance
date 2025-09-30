// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { RetryPRetryAdapter } from "../../src/retry/RetryPRetryAdapter"
import { RetryOptions } from "../../src/retry/RetryOptions"
import { ConstraintsValidationError } from "../../src/errors/ConstraintsValidationError"

describe("RetryPRetryAdapter", () => {
  let service: RetryPRetryAdapter

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetryPRetryAdapter],
    }).compile()

    service = module.get<RetryPRetryAdapter>(RetryPRetryAdapter)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("should implement RetryPort interface", () => {
    expect(service).toEqual(
      expect.objectContaining({
        execute: expect.any(Function),
      }),
    )
  })

  describe("execute", () => {
    it("should execute function successfully on first try", async () => {
      const mockFn = jest.fn().mockResolvedValue("success")

      const result = await service.execute(mockFn)

      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it("should retry on failure and eventually succeed", async () => {
      const mockFn = jest.fn().mockRejectedValueOnce(new Error("First failure")).mockResolvedValue("success")

      const result = await service.execute(mockFn, { retries: 2, minTimeout: 10, maxTimeout: 20 })

      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it("should throw error after exhausting retries", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("Persistent failure"))

      await expect(service.execute(mockFn, { retries: 2, minTimeout: 10, maxTimeout: 20 })).rejects.toThrow(
        "Persistent failure",
      )
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it("should not retry ValidationError by default", async () => {
      const validationError = new ConstraintsValidationError(["Invalid input"])
      const mockFn = jest.fn().mockRejectedValue(validationError)

      await expect(service.execute(mockFn, { retries: 3, minTimeout: 10, maxTimeout: 20 })).rejects.toThrow(
        "Invalid input",
      )
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it("should use custom shouldNotRetry function when provided", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("Custom error"))
      const customOptions: RetryOptions = {
        retries: 2,
        minTimeout: 10,
        maxTimeout: 20,
        shouldNotRetry: (error) => error.message === "Custom error",
      }

      await expect(service.execute(mockFn, customOptions)).rejects.toThrow("Custom error")
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })
})
