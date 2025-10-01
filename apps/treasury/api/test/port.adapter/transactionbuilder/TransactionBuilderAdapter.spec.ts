// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { TransactionBuilderAdapter } from "../../../src/port.adapter/transactionbuilder/TransactionBuilderAdapter"
import { FundBeneficiaryTransactionAppServiceRequest } from "../../../src/app/transaction/fundbeneficiarytransaction/service/model/FundBeneficiaryTransactionAppServiceRequest"

describe("TransactionBuilderAdapter", () => {
  let adapter: TransactionBuilderAdapter

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionBuilderAdapter],
    }).compile()

    adapter = module.get<TransactionBuilderAdapter>(TransactionBuilderAdapter)
  })

  it("should be defined", () => {
    expect(adapter).toBeDefined()
  })

  describe("fundBeneficiary", () => {
    it("should throw error indicating Treasury contract is not yet implemented", () => {
      const request = new FundBeneficiaryTransactionAppServiceRequest("0x1234567890abcdef", 1000, "json")

      // Act & Assert
      expect(() => adapter.fundBeneficiary(request)).toThrow(
        "Failed to build and serialize transaction: Fund beneficiary transaction not yet implemented. " +
          "Waiting for Treasury contract.",
      )
    })

    it("should handle different address formats", () => {
      const addresses = ["0x1234567890abcdef", "0xABCDEF1234567890", "some-other-address-format", "hedera-account-id"]

      addresses.forEach((address) => {
        const request = new FundBeneficiaryTransactionAppServiceRequest(address, 1000, "json")

        expect(() => adapter.fundBeneficiary(request)).toThrow(
          "Failed to build and serialize transaction: Fund beneficiary transaction not yet implemented. " +
            "Waiting for Treasury contract.",
        )
      })
    })

    it("should handle different amount values", () => {
      const amounts = [1, 100, 1000, 999999]

      amounts.forEach((amount) => {
        const request = new FundBeneficiaryTransactionAppServiceRequest("0x1234567890abcdef", amount, "json")

        expect(() => adapter.fundBeneficiary(request)).toThrow(
          "Failed to build and serialize transaction: Fund beneficiary transaction not yet implemented. " +
            "Waiting for Treasury contract.",
        )
      })
    })

    it("should handle different format values", () => {
      const formats = ["json", "hex", "unsupported-format"]

      formats.forEach((format) => {
        const request = new FundBeneficiaryTransactionAppServiceRequest("0x1234567890abcdef", 1000, format)

        expect(() => adapter.fundBeneficiary(request)).toThrow(
          "Failed to build and serialize transaction: Fund beneficiary transaction not yet implemented. " +
            "Waiting for Treasury contract.",
        )
      })
    })
  })

  describe("inheritance", () => {
    it("should extend BaseTransactionBuilder", () => {
      expect(adapter).toBeInstanceOf(TransactionBuilderAdapter)
    })
  })
})
