// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { DistributionRepository } from "@domain/distribution/repositories/DistributionRepository"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { SyncRedemptionAppServiceRequest } from "@app/redemption/syncredemption/model/SyncRedemptionAppServiceRequest"
import { AddRedemptionHolderCommand } from "@app/redemption/addredemptionholder/AddRedemptionHolderCommand"
import { RedemptionHolderStatus } from "@domain/redemption/model/RedemptionHolderStatus"

@Singleton()
export class SyncRedemptionAppService {
  constructor(
    @Inject() private readonly distributionRepository: DistributionRepository,
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Validate()
  async execute(request: SyncRedemptionAppServiceRequest): Promise<void> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(request.treasuryContractId)

    treasury.ensurePaymentTokenConfigured()
    const paymentTokenId = (treasury.paymentToken as any).id

    await this.processSuccessfulHolders(request.successAddresses, request.paidAmounts, treasury.id, paymentTokenId)
    await this.processFailedHolders(request.failedAddresses, treasury.id, paymentTokenId)
    await this.processAlreadyPaidHolders(
      request.alreadyPaidAddresses,
      request.alreadyPaidAmounts,
      treasury.id,
      paymentTokenId,
    )
  }

  private async processSuccessfulHolders(
    addresses: string[],
    paidAmounts: string[],
    treasuryId: string,
    paymentTokenId: string,
  ): Promise<void> {
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i]
      const amount = paidAmounts[i]
      await this.commandBus.execute(
        new AddRedemptionHolderCommand(address, RedemptionHolderStatus.SUCCESS, amount, treasuryId, paymentTokenId),
      )
    }
  }

  private async processFailedHolders(addresses: string[], treasuryId: string, paymentTokenId: string): Promise<void> {
    for (const address of addresses) {
      await this.commandBus.execute(
        new AddRedemptionHolderCommand(address, RedemptionHolderStatus.FAILED, undefined, treasuryId, paymentTokenId),
      )
    }
  }

  private async processAlreadyPaidHolders(
    addresses: string[],
    paidAmounts: string[],
    treasuryId: string,
    paymentTokenId: string,
  ): Promise<void> {
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i]
      const amount = paidAmounts[i]
      await this.commandBus.execute(
        new AddRedemptionHolderCommand(
          address,
          RedemptionHolderStatus.ALREADY_PAID,
          amount,
          treasuryId,
          paymentTokenId,
        ),
      )
    }
  }
}
