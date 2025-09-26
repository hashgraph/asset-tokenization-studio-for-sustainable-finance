// SPDX-License-Identifier: Apache-2.0

import { RetryExecutor } from "../../src/retry/RetryExecutor"
import { RetryOptions } from "../../src/retry/RetryOptions"
import { AbortError } from "p-retry"

describe("RetryExecutor", () => {
  let retryExecutor: RetryExecutor

  beforeEach(() => {
    retryExecutor = new RetryExecutor("TestContext")
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("execute", () => {
    it("should execute function successfully on first attempt", async () => {
      const mockFn = jest.fn().mockResolvedValue("success")

      const result = await retryExecutor.execute(mockFn)

      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it("should execute synchronous function successfully", async () => {
      const mockFn = jest.fn().mockReturnValue("sync-success")

      const result = await retryExecutor.execute(mockFn)

      expect(result).toBe("sync-success")
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it("should retry failed function and eventually succeed", async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("First attempt failed"))
        .mockRejectedValueOnce(new Error("Second attempt failed"))
        .mockResolvedValue("success")

      const result = await retryExecutor.execute(mockFn, { retries: 3, minTimeout: 10, maxTimeout: 20 })

      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it("should fail after exhausting all retries", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("Always fails"))

      await expect(retryExecutor.execute(mockFn, { retries: 2, minTimeout: 10, maxTimeout: 20 })).rejects.toThrow(
        "Always fails",
      )

      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it("should use default options when none provided", async () => {
      const mockFn = jest.fn().mockRejectedValueOnce(new Error("First attempt failed")).mockResolvedValue("success")

      const result = await retryExecutor.execute(mockFn, { minTimeout: 10, maxTimeout: 100 })

      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it("should merge custom options with defaults", async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("First attempt failed"))
        .mockRejectedValueOnce(new Error("Second attempt failed"))
        .mockResolvedValue("success")

      const customOptions: RetryOptions = {
        retries: 5,
        minTimeout: 10,
      }

      const result = await retryExecutor.execute(mockFn, customOptions)

      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it("should respect shouldRetry function", async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Retryable error"))
        .mockRejectedValueOnce(new Error("Non-retryable error"))
        .mockResolvedValue("success")

      const shouldRetry = jest.fn((error: Error) => error.message === "Retryable error")

      await expect(
        retryExecutor.execute(mockFn, {
          retries: 3,
          minTimeout: 10,
          maxTimeout: 20,
          shouldRetry,
        }),
      ).rejects.toThrow("Non-retryable error")

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(shouldRetry).toHaveBeenCalledTimes(2)
    })

    it("should not retry when shouldRetry returns false", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("Non-retryable"))
      const shouldRetry = jest.fn().mockReturnValue(false)

      await expect(
        retryExecutor.execute(mockFn, {
          retries: 3,
          minTimeout: 10,
          maxTimeout: 20,
          shouldRetry,
        }),
      ).rejects.toThrow("Non-retryable")

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(shouldRetry).toHaveBeenCalledTimes(1)
    })

    it("should handle multiple failed attempts before success", async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("First failure"))
        .mockRejectedValueOnce(new Error("Second failure"))
        .mockResolvedValue("success")

      const result = await retryExecutor.execute(mockFn, {
        retries: 3,
        minTimeout: 10,
        maxTimeout: 20,
      })

      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it("should handle AbortError and not retry", async () => {
      const abortError = new AbortError(new Error("Should not retry"))
      const mockFn = jest.fn().mockRejectedValue(abortError)

      await expect(retryExecutor.execute(mockFn, { retries: 3, minTimeout: 10, maxTimeout: 20 })).rejects.toThrow(
        "Should not retry",
      )

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it("should handle functions that return undefined", async () => {
      const mockFn = jest.fn().mockResolvedValue(undefined)

      const result = await retryExecutor.execute(mockFn)

      expect(result).toBeUndefined()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it("should handle functions that return null", async () => {
      const mockFn = jest.fn().mockResolvedValue(null)

      const result = await retryExecutor.execute(mockFn)

      expect(result).toBeNull()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it("should handle functions that throw synchronous errors", async () => {
      const mockFn = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error("Sync error")
        })
        .mockResolvedValue("success")

      const result = await retryExecutor.execute(mockFn, { retries: 2, minTimeout: 10, maxTimeout: 20 })

      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it("should preserve function context and arguments", async () => {
      const contextObj = { value: "test" }
      const mockFn = jest.fn(function (this: typeof contextObj, arg1: string, arg2: number) {
        return `${this.value}-${arg1}-${arg2}`
      })

      const boundFn = mockFn.bind(contextObj, "hello", 42)
      const result = await retryExecutor.execute(boundFn)

      expect(result).toBe("test-hello-42")
      expect(mockFn).toHaveBeenCalledWith("hello", 42)
    })

    it("should handle complex retry scenarios with mixed success/failure", async () => {
      let callCount = 0
      const mockFn = jest.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) throw new Error("First failure")
        if (callCount === 2) throw new Error("Second failure")
        if (callCount === 3) return "success"
        throw new Error("Should not reach here")
      })

      const result = await retryExecutor.execute(mockFn, {
        retries: 3,
        minTimeout: 10,
        maxTimeout: 20,
        factor: 1.5,
      })

      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledTimes(3)
    })
  })

  describe("mergeWithDefaults", () => {
    it("should use all default values when no options provided", () => {
      const executor = new RetryExecutor("TestContext")

      const mergedOptions = (executor as any).mergeWithDefaults({})

      expect(mergedOptions).toEqual({
        retries: expect.any(Number),
        minTimeout: expect.any(Number),
        maxTimeout: expect.any(Number),
        factor: expect.any(Number),
      })
    })

    it("should merge partial options with defaults", () => {
      const executor = new RetryExecutor("TestContext")
      const customOptions = { retries: 5, minTimeout: 100 }

      const mergedOptions = (executor as any).mergeWithDefaults(customOptions)

      expect(mergedOptions.retries).toBe(5)
      expect(mergedOptions.minTimeout).toBe(100)
      expect(mergedOptions.maxTimeout).toEqual(expect.any(Number))
      expect(mergedOptions.factor).toEqual(expect.any(Number))
    })
  })
})
