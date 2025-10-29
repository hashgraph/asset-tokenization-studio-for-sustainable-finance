import { ConverterUtils } from "./ConverterUtils"

describe("ConverterUtils", () => {
  describe("formatNumber", () => {
    it("should format numbers correctly with standard cases", () => {
      expect(ConverterUtils.formatNumber("123456789", 6)).toBe("123.456789")
      expect(ConverterUtils.formatNumber("100000000", 8)).toBe("1")
      expect(ConverterUtils.formatNumber("150000000", 8)).toBe("1.5")
    })

    it("should handle edge case where value length is less than decimals", () => {
      // This is the problematic case that produces "0.9.499999"
      expect(ConverterUtils.formatNumber("9499999", 8)).toBe("0.09499999")
      expect(ConverterUtils.formatNumber("123", 6)).toBe("0.000123")
      expect(ConverterUtils.formatNumber("1", 8)).toBe("0.00000001")
    })

    it("should handle zero values", () => {
      expect(ConverterUtils.formatNumber("0", 8)).toBe("0")
      expect(ConverterUtils.formatNumber("00000000", 8)).toBe("0")
    })

    it("should remove trailing zeros", () => {
      expect(ConverterUtils.formatNumber("150000000", 8)).toBe("1.5")
      expect(ConverterUtils.formatNumber("100000000", 8)).toBe("1")
      expect(ConverterUtils.formatNumber("123456000", 8)).toBe("1.23456")
    })

    it("should handle the specific case from the bug report", () => {
      // The balance "0.9.499999" suggests the raw value might be "9499999" with 8 decimals
      expect(ConverterUtils.formatNumber("9499999", 8)).toBe("0.09499999")
    })
  })
})
