// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { FundBeneficiaryTransactionAppService } from "../../../../../src/app/transaction/fundbeneficiarytransaction/service/FundBeneficiaryTransactionAppService"
import { FundBeneficiaryTransactionAppServiceRequest } from "../../../../../src/app/transaction/fundbeneficiarytransaction/service/model/FundBeneficiaryTransactionAppServiceRequest"
import { TransactionBuilderPort } from "../../../../../src/port.adapter/transactionbuilder/TransactionBuilderPort"
import { BuildTransactionResponse } from "@hashgraph/green-bonds-shared-core"

describe("FundBeneficiaryTransactionAppService", () => {
  let service: FundBeneficiaryTransactionAppService
  let mockTransactionBuilderPort: jest.Mocked<TransactionBuilderPort>

  beforeEach(async () => {
    mockTransactionBuilderPort = {
      fundBeneficiary: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundBeneficiaryTransactionAppService,
        {
          provide: "TransactionBuilderPort",
          useValue: mockTransactionBuilderPort,
        },
      ],
    }).compile()

    service = module.get<FundBeneficiaryTransactionAppService>(FundBeneficiaryTransactionAppService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("execute", () => {
    it("should call transactionBuilderPort.fundBeneficiary with the correct request", () => {
      const request = new FundBeneficiaryTransactionAppServiceRequest("0x1234567890abcdef", 1000, "json")
      const expectedResponse = new BuildTransactionResponse("serialized-tx")
      mockTransactionBuilderPort.fundBeneficiary.mockReturnValue(expectedResponse)

      const result = service.execute(request)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const fundBeneficiaryMock = mockTransactionBuilderPort.fundBeneficiary as jest.MockedFunction<
        typeof mockTransactionBuilderPort.fundBeneficiary
      >
      expect(fundBeneficiaryMock).toHaveBeenCalledWith(request)
      expect(result).toBe(expectedResponse)
    })

    it("should return the response from transactionBuilderPort", () => {
      const request = new FundBeneficiaryTransactionAppServiceRequest("0xabcdef1234567890", 2000, "hex")
      const expectedResponse = new BuildTransactionResponse("another-serialized-tx")
      mockTransactionBuilderPort.fundBeneficiary.mockReturnValue(expectedResponse)

      const result = service.execute(request)

      expect(result).toEqual(expectedResponse)
    })
  })
})
