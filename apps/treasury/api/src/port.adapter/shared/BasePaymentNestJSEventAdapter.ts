import { ConverterUtils } from "@hashgraph/green-bonds-shared-core/dist/utils/ConverterUtils"

export abstract class BasePaymentNestJSEventAdapter {
  private readonly ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

  protected filterSuccessData(addresses: string[], amounts: string[]): { addresses: string[]; amounts: string[] } {
    const filteredAddresses: string[] = []
    const filteredAmounts: string[] = []

    for (let i = 0; i < addresses.length; i++) {
      if (this.isNonZeroAddress(addresses[i])) {
        filteredAddresses.push(addresses[i])
        filteredAmounts.push(amounts[i])
      }
    }

    return { addresses: filteredAddresses, amounts: filteredAmounts }
  }

  protected filterNonZeroAddresses(addresses: string[]): string[] {
    return addresses.filter((address) => this.isNonZeroAddress(address))
  }

  protected isNonZeroAddress(address: string): boolean {
    return address.toLowerCase() !== this.ZERO_ADDRESS
  }

  protected async convertToHederaFormat(addresses: string[]): Promise<string[]> {
    return Promise.all(addresses.map((address) => ConverterUtils.getHederaAddressFromEvm(address)))
  }
}
