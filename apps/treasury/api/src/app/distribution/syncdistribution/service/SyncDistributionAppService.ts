// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { SyncDistributionAppServiceRequest } from "@app/distribution/syncdistribution/service/model/SyncDistributionAppServiceRequest"
import type { DistributionRepository } from "@domain/distribution/repositories/DistributionRepository"
import { CreateDistributionCommand } from "@app/distribution/createdistribution/command/CreateDistributionCommand"
import { AddDistributionHolderCommand } from "@app/distribution/adddistributionholder/command/AddDistributionHolderCommand"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { DistributionHolderStatus } from "@domain/distribution/model/DistributionHolderStatus"

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

    treasury.ensurePaymentTokenConfigured()
    const paymentTokenId = (treasury.paymentToken as any).id

    await this.processSuccessfulHolders(
      request.successAddresses,
      request.paidAmounts,
      request.distributionId,
      paymentTokenId,
    )
    await this.processFailedHolders(request.failedAddresses, request.distributionId, paymentTokenId)
    await this.processAlreadyPaidHolders(
      request.alreadyPaidAddresses,
      request.alreadyPaidAmounts,
      request.distributionId,
      paymentTokenId,
    )
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
    paymentTokenId: string,
  ): Promise<void> {
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i]
      const amount = paidAmounts[i]
      await this.commandBus.execute(
        new AddDistributionHolderCommand(
          address,
          DistributionHolderStatus.SUCCESS,
          amount,
          distributionId,
          paymentTokenId,
        ),
      )
    }
  }

  private async processFailedHolders(
    addresses: string[],
    distributionId: number,
    paymentTokenId: string,
  ): Promise<void> {
    for (const address of addresses) {
      await this.commandBus.execute(
        new AddDistributionHolderCommand(
          address,
          DistributionHolderStatus.FAILED,
          undefined,
          distributionId,
          paymentTokenId,
        ),
      )
    }
  }

  private async processAlreadyPaidHolders(
    addresses: string[],
    paidAmounts: string[],
    distributionId: number,
    paymentTokenId: string,
  ): Promise<void> {
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i]
      const amount = paidAmounts[i]
      await this.commandBus.execute(
        new AddDistributionHolderCommand(
          address,
          DistributionHolderStatus.ALREADY_PAID,
          amount,
          distributionId,
          paymentTokenId,
        ),
      )
    }
  }
}
