// SPDX-License-Identifier: Apache-2.0
import { type CommandBus, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CouponSetDLTEvent } from "@port/bond/usecase/setbondcoupon/model/CouponSetDLTEvent"
import { SetBondCouponCommand } from "@app/bond/setbondcoupon/command/SetBondCouponCommand"
import { SetBondCouponPort } from "@port/bond/usecase/setbondcoupon/SetBondCouponPort"

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
        event.recordDate,
        event.executionDate,
        event.rate,
      ),
    )
  }
}
