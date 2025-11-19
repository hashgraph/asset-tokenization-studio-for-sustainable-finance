// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { SyncDistributionAppServiceRequest } from "@app/distribution/syncdistribution/service/model/SyncDistributionAppServiceRequest"
import type { DistributionRepository } from "@domain/distribution/repositories/DistributionRepository"
import { CreateDistributionCommand } from "@app/distribution/createdistribution/command/CreateDistributionCommand"
import { AddDistributionHolderCommand } from "@app/distribution/adddistributionholder/command/AddDistributionHolderCommand"
import { DistributionHolderStatus } from "@domain/distribution/model/DistributionHolderStatus"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"
import { PaymentResultItemAppServiceRequestModel } from "@app/shared/model/PaymentResultItemAppServiceRequestModel"

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
    await this.processResults(request.results, request.distributionId, paymentTokenId)
  }

  private async ensureDistributionExists(distributionId: number, treasuryId: string): Promise<void> {
    const existingDistribution = await this.distributionRepository.findById(distributionId)

    if (!existingDistribution) {
      await this.commandBus.execute(new CreateDistributionCommand(distributionId, treasuryId))
    }
  }

  private async processResults(
    items: PaymentResultItemAppServiceRequestModel[],
    distributionId: number,
    paymentTokenId: string,
  ): Promise<void> {
    for (const item of items) {
      if (item.status === 0) {
        await this.commandBus.execute(
          new AddDistributionHolderCommand(
            item.holder,
            DistributionHolderStatus.SUCCESS,
            item.amount,
            distributionId,
            paymentTokenId,
          ),
        )
      } else if (item.status === 1) {
        await this.commandBus.execute(
          new AddDistributionHolderCommand(
            item.holder,
            DistributionHolderStatus.FAILED,
            undefined,
            distributionId,
            paymentTokenId,
          ),
        )
      }
    }
  }
}
