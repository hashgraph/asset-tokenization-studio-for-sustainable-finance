// SPDX-License-Identifier: Apache-2.0

import { SyncDistributionPort } from "@port/distribution/usecase/syncdistribution/SyncDistributionPort"
import { ConverterUtils, Handler, Singleton } from "@hashgraph/green-bonds-shared-core"
import { DistributionExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionExecutedDLTEvent"
import { DistributionByAddressesExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/DistributionByAddressesExecutedDLTEvent"
import { SyncDistributionAppService } from "@app/distribution/syncdistribution/service/SyncDistributionAppService"
import { SyncDistributionAppServiceRequest } from "@app/distribution/syncdistribution/service/model/SyncDistributionAppServiceRequest"
import { BaseDistributionExecutedDLTEvent } from "@port/distribution/usecase/syncdistribution/model/BaseDistributionExecutedDLTEvent"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

@Singleton()
export class SyncDistributionNestJSEventAdapter implements SyncDistributionPort {
  constructor(private readonly syncDistributionAppService: SyncDistributionAppService) {}

  @Handler(DistributionExecutedDLTEvent)
  async handleDistributionExecuted(event: DistributionExecutedDLTEvent): Promise<void> {
    await this.processDistributionEvent(event)
  }

  @Handler(DistributionByAddressesExecutedDLTEvent)
  async handleDistributionByAddressesExecuted(event: DistributionByAddressesExecutedDLTEvent): Promise<void> {
    await this.processDistributionEvent(event)
  }

  private async processDistributionEvent(event: BaseDistributionExecutedDLTEvent): Promise<void> {
    const { addresses: successAddresses, amounts: paidAmounts } = this.filterSuccessData(
      event.result.succeededAddresses,
      event.result.paidAmounts,
    )
    const failedAddresses = this.filterNonZeroAddresses(event.result.failedAddresses)

    const [convertedSuccessAddresses, convertedFailedAddresses] = await Promise.all([
      this.convertToHederaFormat(successAddresses),
      this.convertToHederaFormat(failedAddresses),
    ])

    await this.syncDistributionAppService.execute({
      treasuryContractId: event.contractId,
      distributionId: event.distributionId,
      successAddresses: convertedSuccessAddresses,
      failedAddresses: convertedFailedAddresses,
      paidAmounts,
    } as SyncDistributionAppServiceRequest)
  }

  private filterSuccessData(addresses: string[], amounts: string[]): { addresses: string[]; amounts: string[] } {
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

  private filterNonZeroAddresses(addresses: string[]): string[] {
    return addresses.filter((address) => this.isNonZeroAddress(address))
  }

  private isNonZeroAddress(address: string): boolean {
    return address.toLowerCase() !== ZERO_ADDRESS
  }

  private async convertToHederaFormat(addresses: string[]): Promise<string[]> {
    return Promise.all(addresses.map((address) => ConverterUtils.getHederaAddressFromEvm(address)))
  }
}
