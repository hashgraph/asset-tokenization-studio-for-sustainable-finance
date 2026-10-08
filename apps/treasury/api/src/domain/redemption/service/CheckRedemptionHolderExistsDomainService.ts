// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { RedemptionHolderRepository } from "@domain/redemption/repositories/RedemptionHolderRepository"
import { RedemptionHolderStatus } from "@domain/redemption/model/RedemptionHolderStatus"
import { RedemptionHolder } from "@domain/redemption/model/RedemptionHolder"
import { RedemptionHolderNotFoundError } from "@domain/redemption/error/RedemptionHolderNotFoundError"

@Singleton()
export class CheckRedemptionHolderExistsDomainService {
  constructor(@Inject() private readonly redemptionHolderRepository: RedemptionHolderRepository) {}

  async execute(
    treasuryId: string,
    holderAccountId: string,
    status: RedemptionHolderStatus,
  ): Promise<RedemptionHolder> {
    const redemptionHolder = await this.redemptionHolderRepository.findOneByTreasuryIdAndHolderAccountIdAndStatus(
      treasuryId,
      holderAccountId,
      status,
    )
    if (!redemptionHolder) {
      throw RedemptionHolderNotFoundError.treasuryIdAndholderAccountIdErrorAndStatus(
        treasuryId,
        holderAccountId,
        status,
      )
    }
    return redemptionHolder
  }
}
