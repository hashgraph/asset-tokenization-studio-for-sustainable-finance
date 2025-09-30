// SPDX-License-Identifier: Apache-2.0

import { Retryable } from "../../src/decorators/Retryable"
import { RetryPRetryAdapter } from "../../src/retry/RetryPRetryAdapter"

jest.mock("../../src/retry/RetryPRetryAdapter")

describe("@Retryable", () => {
  let mockService: jest.Mocked<RetryPRetryAdapter>
  let mockExecute: jest.Mock

  beforeEach(() => {
    mockExecute = jest.fn()
    mockService = {
      execute: mockExecute,
    } as any
    ;(RetryPRetryAdapter as jest.MockedClass<typeof RetryPRetryAdapter>).mockImplementation(() => mockService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("decorator application", () => {
    it("should apply to async methods and delegate to RetryPRetryAdapter", async () => {
      mockExecute.mockResolvedValue("success")

      class TestClass {
        @Retryable({ retries: 2, minTimeout: 10 })
        async testMethod(): Promise<string> {
          return Promise.resolve("original")
        }
      }

      const instance = new TestClass()
      const result = await instance.testMethod()

      expect(result).toBe("success")
      expect(RetryPRetryAdapter).toHaveBeenCalled()
      expect(mockExecute).toHaveBeenCalledWith(
        expect.any(Function),
        { retries: 2, minTimeout: 10 },
        "TestClass.testMethod",
      )
    })

    it("should apply to sync methods and delegate to RetryPRetryAdapter", async () => {
      mockExecute.mockResolvedValue("success")

      class TestClass {
        @Retryable({ retries: 1, minTimeout: 10 })
        testMethod(): string {
          return "original"
        }
      }

      const instance = new TestClass()
      const result = await (instance.testMethod as any)()

      expect(result).toBe("success")
      expect(RetryPRetryAdapter).toHaveBeenCalled()
      expect(mockExecute).toHaveBeenCalledWith(
        expect.any(Function),
        { retries: 1, minTimeout: 10 },
        "TestClass.testMethod",
      )
    })

    it("should create RetryPRetryAdapter instance", async () => {
      mockExecute.mockResolvedValue("success")

      class MyCustomClass {
        @Retryable({ retries: 1 })
        async myMethod(): Promise<string> {
          return Promise.resolve("test")
        }
      }

      const instance = new MyCustomClass()
      await instance.myMethod()

      expect(RetryPRetryAdapter).toHaveBeenCalled()
      expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), { retries: 1 }, "MyCustomClass.myMethod")
    })
  })

  describe("method context and arguments preservation", () => {
    it("should preserve method context (this) when executing", async () => {
      mockExecute.mockImplementation(async (fn: () => Promise<string>) => {
        return await fn()
      })

      class TestClass {
        value = "test-value"

        @Retryable({ retries: 1, minTimeout: 10 })
        async testMethod(): Promise<string> {
          return Promise.resolve(this.value)
        }
      }

      const instance = new TestClass()
      const result = await instance.testMethod()

      expect(result).toBe("test-value")
    })

    it("should preserve method arguments when executing", async () => {
      let capturedArgs: any[]

      mockExecute.mockImplementation(async (fn: () => Promise<string>) => {
        return await fn()
      })

      class TestClass {
        @Retryable({ retries: 1, minTimeout: 10 })
        async testMethod(arg1: string, arg2: number): Promise<string> {
          capturedArgs = [arg1, arg2]
          return Promise.resolve(`${arg1}-${arg2}`)
        }
      }

      const instance = new TestClass()
      const result = await instance.testMethod("hello", 42)

      expect(capturedArgs).toEqual(["hello", 42])
      expect(result).toBe("hello-42")
    })

    it("should handle methods with no parameters", async () => {
      mockExecute.mockResolvedValue("no-params")

      class TestClass {
        @Retryable({ retries: 1, minTimeout: 10 })
        testMethod(): string {
          return "original"
        }
      }

      const instance = new TestClass()
      const result = await (instance.testMethod as any)()

      expect(result).toBe("no-params")
      expect(mockExecute).toHaveBeenCalledWith(
        expect.any(Function),
        { retries: 1, minTimeout: 10 },
        "TestClass.testMethod",
      )
    })
  })

  describe("options handling", () => {
    it("should pass options to RetryPRetryAdapter execute method", async () => {
      mockExecute.mockResolvedValue("success")

      const customOptions = {
        retries: 5,
        minTimeout: 100,
        maxTimeout: 1000,
        factor: 3,
        shouldRetry: (error: Error) => error.message !== "no-retry",
      }

      class TestClass {
        @Retryable(customOptions)
        async testMethod(): Promise<string> {
          return Promise.resolve("test")
        }
      }

      const instance = new TestClass()
      await instance.testMethod()

      expect(RetryPRetryAdapter).toHaveBeenCalled()
      expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), customOptions, "TestClass.testMethod")
    })

    it("should handle empty options", async () => {
      mockExecute.mockResolvedValue("success")

      class TestClass {
        @Retryable()
        async testMethod(): Promise<string> {
          return Promise.resolve("test")
        }
      }

      const instance = new TestClass()
      await instance.testMethod()

      expect(RetryPRetryAdapter).toHaveBeenCalled()
      expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), {}, "TestClass.testMethod")
    })
  })

  describe("edge cases", () => {
    it("should handle methods that return undefined", async () => {
      mockExecute.mockResolvedValue(undefined)

      class TestClass {
        @Retryable({ retries: 1, minTimeout: 10 })
        testMethod(): void {}
      }

      const instance = new TestClass()
      const result = await (instance.testMethod as any)()

      expect(result).toBeUndefined()
    })

    it("should handle methods that return null", async () => {
      mockExecute.mockResolvedValue(null)

      class TestClass {
        @Retryable({ retries: 1, minTimeout: 10 })
        testMethod(): null {
          return null
        }
      }

      const instance = new TestClass()
      const result = await (instance.testMethod as any)()

      expect(result).toBeNull()
    })

    it("should propagate errors from RetryPRetryAdapter", async () => {
      const error = new Error("Retry failed")
      mockExecute.mockRejectedValue(error)

      class TestClass {
        @Retryable({ retries: 1, minTimeout: 10 })
        async testMethod(): Promise<string> {
          return Promise.resolve("test")
        }
      }

      const instance = new TestClass()

      await expect(instance.testMethod()).rejects.toThrow("Retry failed")
    })
  })
})
