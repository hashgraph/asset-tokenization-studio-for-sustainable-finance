// SPDX-License-Identifier: Apache-2.0
import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { RedeemedByPartitionDLTEvent } from "@port/bond/usecase/redeembondholderbalance/model/RedeemedByPartitionDLTEvent"
import { RedeemBondHolderBalanceCommand } from "@app/bond/redeembondholderbalance/command/RedeemBondHolderBalanceCommand"
import { RedeemBondHolderBalancePort } from "./RedeemBondHolderBalancePort"

@Singleton()
export class RedeemBondHolderBalanceNestJSEventAdapter
  implements RedeemBondHolderBalancePort, EventListener<RedeemedByPartitionDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(RedeemedByPartitionDLTEvent)
  async handle(event: RedeemedByPartitionDLTEvent): Promise<void> {
    const bondContractId = await ConverterUtils.getHederaAddressFromEvm(event.contractId)
    const holderAccountId = await ConverterUtils.getHederaAddressFromEvm(event.from)

    await this.commandBus.execute(
      new RedeemBondHolderBalanceCommand(bondContractId, holderAccountId, event.partition, event.value),
    )
  }
}
