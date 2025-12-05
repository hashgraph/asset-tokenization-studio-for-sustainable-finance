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
    await this.commandBus.execute(
      new SetBondCouponCommand(
        event.contractId,
        event.corporateActionId,
        event.couponId,
        event.operator,
        new Date(Number(event.recordDate) * 1000),
        new Date(Number(event.executionDate) * 1000),
        event.rate,
        event.rateDecimals,
        event.period,
      ),
    )
  }
}
