// SPDX-License-Identifier: Apache-2.0
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { SetBondCouponCommand } from "./SetBondCouponCommand"
import { SetBondCouponDomainService } from "@domain/coupon/service/SetBondCouponDomainService"
import { BondCouponSetEvent } from "@domain/coupon/event/BondCouponSetEvent"

@Singleton()
@Handler(SetBondCouponCommand)
export class SetBondCouponCommandHandler implements CommandHandler<SetBondCouponCommand, void> {
  constructor(
    private readonly setBondCouponDomainService: SetBondCouponDomainService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: SetBondCouponCommand): Promise<void> {
    const bondCoupon = await this.setBondCouponDomainService.execute(command)
    this.eventBus.publish(
      new BondCouponSetEvent(
        bondCoupon.bondContractId,
        bondCoupon.corporateActionId,
        bondCoupon.id,
        bondCoupon.operator,
        bondCoupon.recordDate,
        bondCoupon.executionDate,
        bondCoupon.rate,
        bondCoupon.rateDecimals,
        bondCoupon.period,
      ),
    )
  }
}
