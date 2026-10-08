// SPDX-License-Identifier: Apache-2.0
import { EntityNotFoundError } from "@hashgraph/green-bonds-shared-core"

export class BondCouponNotFoundError extends EntityNotFoundError {
  static couponIdError(bondContractId: string, couponId: string): BondCouponNotFoundError {
    return new BondCouponNotFoundError(`Coupon with id ${couponId} not found for bond ${bondContractId}.`)
  }

  private constructor(message: string) {
    super(message)
  }
}
