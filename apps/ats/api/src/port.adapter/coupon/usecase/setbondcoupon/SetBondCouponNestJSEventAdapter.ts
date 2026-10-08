// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CouponSetDLTEvent } from "@port/coupon/usecase/setbondcoupon/model/CouponSetDLTEvent"
import { SetBondCouponCommand } from "@app/coupon/setbondcoupon/command/SetBondCouponCommand"
import { SetBondCouponPort } from "@port/coupon/usecase/setbondcoupon/SetBondCouponPort"

@Singleton()
export class SetBondCouponNestJSEventAdapter implements SetBondCouponPort, EventListener<CouponSetDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(CouponSetDLTEvent)
  async handle(event: CouponSetDLTEvent): Promise<void> {
    const { coupon } = event
    await this.commandBus.execute(
      new SetBondCouponCommand(
        event.contractId,
        event.corporateActionId,
        event.couponId,
        event.operator,
        new Date(Number(coupon.recordDate) * 1000),
        new Date(Number(coupon.executionDate) * 1000),
        new Date(Number(coupon.startDate) * 1000),
        new Date(Number(coupon.endDate) * 1000),
        new Date(Number(coupon.fixingDate) * 1000),
        coupon.rate,
        coupon.rateDecimals,
        coupon.rateStatus,
      ),
    )
  }
}
