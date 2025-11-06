// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EnvironmentalAssetRepository } from "@domain/environmentalasset/repositories/EnvironmentalAssetRepository"
import type { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"
import { SyncTokenDissociationErrorAppServiceRequest } from "@app/treasury/synctokendissociationerror/service/model/SyncTokenDissociationErrorAppServiceRequest"
import { UpdatePaymentTokenDissociationErrorCommand } from "@app/paymenttoken/updatepaymenttokendissociationerror/command/UpdatePaymentTokenDissociationErrorCommand"
import { UpdateEnvironmentalAssetDissociationErrorCommand } from "@app/environmentalasset/updateenvironmentalassetdissociationerror/UpdateEnvironmentalAssetDissociationErrorCommand"

@Singleton()
export class SyncTokenDissociationErrorAppService {
  constructor(
    @Inject() private readonly paymentTokenRepository: PaymentTokenRepository,
    @Inject() private readonly environmentalAssetRepository: EnvironmentalAssetRepository,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Validate()
  async execute(request: SyncTokenDissociationErrorAppServiceRequest): Promise<void> {
    if (
      await this.paymentTokenRepository.existsByContractIdAndTreasuryContractId(
        request.tokenContractId,
        request.treasuryContractId,
        true,
      )
    ) {
      await this.commandBus.execute(
        new UpdatePaymentTokenDissociationErrorCommand(request.treasuryContractId, request.tokenContractId),
      )
    } else if (
      await this.environmentalAssetRepository.existsByContractIdAndTreasuryContractId(
        request.tokenContractId,
        request.treasuryContractId,
        true,
      )
    ) {
      await this.commandBus.execute(
        new UpdateEnvironmentalAssetDissociationErrorCommand(request.treasuryContractId, request.tokenContractId),
      )
    }
  }
}
