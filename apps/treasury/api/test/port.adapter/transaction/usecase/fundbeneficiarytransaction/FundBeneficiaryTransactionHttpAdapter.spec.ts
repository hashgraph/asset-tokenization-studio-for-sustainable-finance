// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { FundBeneficiaryTransactionHttpAdapter } from "../../../../../src/port.adapter/transaction/usecase/fundbeneficiarytransaction/FundBeneficiaryTransactionHttpAdapter"
import { FundBeneficiaryTransactionAppService } from "../../../../../src/app/transaction/fundbeneficiarytransaction/service/FundBeneficiaryTransactionAppService"
import { FundBeneficiaryTransactionRequest } from "../../../../../src/port.adapter/transaction/usecase/fundbeneficiarytransaction/model/FundBeneficiaryTransactionRequest"
import { FundBeneficiaryTransactionAppServiceRequest } from "../../../../../src/app/transaction/fundbeneficiarytransaction/service/model/FundBeneficiaryTransactionAppServiceRequest"
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"

describe("FundBeneficiaryTransactionHttpAdapter", () => {
  let adapter: FundBeneficiaryTransactionHttpAdapter
  let mockAppService: jest.Mocked<FundBeneficiaryTransactionAppService>

  beforeEach(async () => {
    mockAppService = {
      execute: jest.fn(),
    } as any

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundBeneficiaryTransactionHttpAdapter],
      providers: [
        {
          provide: FundBeneficiaryTransactionAppService,
          useValue: mockAppService,
        },
      ],
    }).compile()

    adapter = module.get<FundBeneficiaryTransactionHttpAdapter>(FundBeneficiaryTransactionHttpAdapter)
  })

  it("should be defined", () => {
    expect(adapter).toBeDefined()
  })

  describe("fundBeneficiary", () => {
    it("should call appService.execute with correct AppServiceRequest", () => {
      const httpRequest = new FundBeneficiaryTransactionRequest("0x1234567890abcdef", 1000, "json")
      const expectedResponse = new TransactionResponse("serialized-tx")
      mockAppService.execute.mockReturnValue(expectedResponse)

      const result = adapter.fundBeneficiary(httpRequest)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const executeMock = mockAppService.execute as jest.MockedFunction<typeof mockAppService.execute>
      expect(executeMock).toHaveBeenCalledWith(expect.any(FundBeneficiaryTransactionAppServiceRequest))

      const calledWith = mockAppService.execute.mock.calls[0][0]
      expect(calledWith.address).toBe(httpRequest.address)
      expect(calledWith.amount).toBe(httpRequest.amount)
      expect(calledWith.format).toBe(httpRequest.format)
      expect(result).toBe(expectedResponse)
    })

    it("should return the response from appService", () => {
      const httpRequest = new FundBeneficiaryTransactionRequest("0xabcdef1234567890", 2000, "hex")
      const expectedResponse = new TransactionResponse("another-serialized-tx")
      mockAppService.execute.mockReturnValue(expectedResponse)

      const result = adapter.fundBeneficiary(httpRequest)

      expect(result).toEqual(expectedResponse)
    })

    it("should handle different address formats", () => {
      const addresses = ["0x1234567890abcdef", "0xABCDEF1234567890", "some-other-address-format"]

      addresses.forEach((address) => {
        const httpRequest = new FundBeneficiaryTransactionRequest(address, 1000, "json")
        const expectedResponse = new TransactionResponse("serialized-tx")
        mockAppService.execute.mockReturnValue(expectedResponse)

        const result = adapter.fundBeneficiary(httpRequest)

        const calledWith = mockAppService.execute.mock.calls[mockAppService.execute.mock.calls.length - 1][0]
        expect(calledWith.address).toBe(address)
        expect(result).toBe(expectedResponse)
      })
    })

    it("should handle different amount values", () => {
      const amounts = [1, 100, 1000, 999999]

      amounts.forEach((amount) => {
        const httpRequest = new FundBeneficiaryTransactionRequest("0x1234567890abcdef", amount, "json")
        const expectedResponse = new TransactionResponse("serialized-tx")
        mockAppService.execute.mockReturnValue(expectedResponse)

        const result = adapter.fundBeneficiary(httpRequest)

        const calledWith = mockAppService.execute.mock.calls[mockAppService.execute.mock.calls.length - 1][0]
        expect(calledWith.amount).toBe(amount)
        expect(result).toBe(expectedResponse)
      })
    })

    it("should handle different format values", () => {
      const formats = ["json", "hex", "base64"]

      formats.forEach((format) => {
        const httpRequest = new FundBeneficiaryTransactionRequest("0x1234567890abcdef", 1000, format)
        const expectedResponse = new TransactionResponse("serialized-tx")
        mockAppService.execute.mockReturnValue(expectedResponse)

        const result = adapter.fundBeneficiary(httpRequest)

        const calledWith = mockAppService.execute.mock.calls[mockAppService.execute.mock.calls.length - 1][0]
        expect(calledWith.format).toBe(format)
        expect(result).toBe(expectedResponse)
      })
    })
  })
})
