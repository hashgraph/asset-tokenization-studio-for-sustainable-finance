// SPDX-License-Identifier: Apache-2.0
import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { IssuedByPartitionDLTEvent } from "@port/bond/usecase/updatebondholderbalance/model/IssuedByPartitionDLTEvent"
import { UpdateBondHolderBalanceCommand } from "@app/bond/updatebondholderbalance/command/UpdateBondHolderBalanceCommand"
import { UpdateBondHolderBalancePort } from "./UpdateBondHolderBalancePort"

@Singleton()
export class UpdateBondHolderBalanceNestJSEventAdapter
  implements UpdateBondHolderBalancePort, EventListener<IssuedByPartitionDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(IssuedByPartitionDLTEvent)
  async handle(event: IssuedByPartitionDLTEvent): Promise<void> {
    const bondContractId = await ConverterUtils.getHederaAddressFromEvm(event.contractId)
    const holderAccountId = await ConverterUtils.getHederaAddressFromEvm(event.to)

    await this.commandBus.execute(
      new UpdateBondHolderBalanceCommand(bondContractId, holderAccountId, event.partition, event.value),
    )
  }
}
