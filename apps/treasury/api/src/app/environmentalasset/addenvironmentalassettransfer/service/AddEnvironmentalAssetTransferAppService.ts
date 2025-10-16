// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { AddEnvironmentalAssetTransferAppServiceRequest } from "@app/environmentalasset/addenvironmentalassettransfer/service/model/AddEnvironmentalAssetTransferAppServiceRequest"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import { TransferType } from "@domain/shared/model/TransferType"
import { AddEnvironmentalAssetTransferCommand } from "@app/environmentalasset/addenvironmentalassettransfer/command/AddEnvironmentalAssetTransferCommand"

@Singleton()
export class AddEnvironmentalAssetTransferAppService {
  constructor(
    @Inject() private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Validate()
  async execute(request: AddEnvironmentalAssetTransferAppServiceRequest): Promise<void> {
    // Check if this transfer is related to an existing environmental asset and treasury
    let transferAccountId
    let transferType
    if (request.tokenId !== undefined) {
      if (
        await this.environmentalAssetRepository.existsByContractIdAndTreasuryContractId(
          request.environmentalAssetContractId,
          request.fromAccountId,
        )
      ) {
        transferAccountId = request.toAccountId
        transferType = <string>TransferType.OUTFLOW
      } else if (
        await this.environmentalAssetRepository.existsByContractIdAndTreasuryContractId(
          request.environmentalAssetContractId,
          request.toAccountId,
        )
      ) {
        transferAccountId = request.fromAccountId
        transferType = <string>TransferType.INFLOW
      }

      if (transferAccountId && transferType) {
        await this.commandBus.execute(
          new AddEnvironmentalAssetTransferCommand(
            transferAccountId,
            request.environmentalAssetContractId,
            request.tokenId,
            transferType,
          ),
        )
      }
    }
  }
}
