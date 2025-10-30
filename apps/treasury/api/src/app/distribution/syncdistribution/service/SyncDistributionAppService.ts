// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { SyncDistributionAppServiceRequest } from "@app/distribution/syncdistribution/service/model/SyncDistributionAppServiceRequest"
import type { DistributionRepository } from "@domain/distribution/repositories/DistributionRepository"
import { CreateDistributionCommand } from "@app/distribution/createdistribution/command/CreateDistributionCommand"
import { AddDistributionHolderCommand } from "@app/distribution/adddistributionholder/command/AddDistributionHolderCommand"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { DistributionHolderStatus } from "@domain/distribution/model/DistributionHolderStatus"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const ZERO_AMOUNT = "0"

@Singleton()
export class SyncDistributionAppService {
  constructor(
    @Inject() private readonly distributionRepository: DistributionRepository,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Validate()
  async execute(request: SyncDistributionAppServiceRequest): Promise<void> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(request.treasuryContractId)

    await this.ensureDistributionExists(request.distributionId, treasury.id)

    const validSuccessAddresses = this.filterZeroAddresses(request.successAddresses)
    const validFailedAddresses = this.filterZeroAddresses(request.failedAddresses)

    await this.processSuccessfulHolders(validSuccessAddresses, request.paidAmounts, request.distributionId)
    await this.processFailedHolders(validFailedAddresses, request.distributionId)
  }

  private filterZeroAddresses(addresses: string[]): string[] {
    return addresses.filter((address) => address && address !== ZERO_ADDRESS)
  }

  private async ensureDistributionExists(distributionId: number, treasuryId: string): Promise<void> {
    const existingDistribution = await this.distributionRepository.findById(distributionId)

    if (!existingDistribution) {
      await this.commandBus.execute(new CreateDistributionCommand(distributionId, treasuryId))
    }
  }

  private async processSuccessfulHolders(
    addresses: string[],
    paidAmounts: string[],
    distributionId: number,
  ): Promise<void> {
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i]
      const amount = paidAmounts[i]
      await this.commandBus.execute(
        new AddDistributionHolderCommand(address, DistributionHolderStatus.SUCCESS, amount, distributionId),
      )
    }
  }

  private async processFailedHolders(addresses: string[], distributionId: number): Promise<void> {
    for (const address of addresses) {
      await this.commandBus.execute(
        new AddDistributionHolderCommand(address, DistributionHolderStatus.FAILED, ZERO_AMOUNT, distributionId),
      )
    }
  }
}
