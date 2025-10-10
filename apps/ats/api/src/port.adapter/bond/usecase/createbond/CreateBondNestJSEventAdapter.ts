import { ConverterUtils, type CommandBus } from '@hashgraph/green-bonds-shared-core'
import { EventListener, Handler, Inject, Singleton } from '@hashgraph/green-bonds-shared-core'
import { BondDeployedDLTEvent } from '@port/bond/usecase/createbond/model/BondDeployedDLTEvent'
import { CreateBondCommand } from '@app/bond/createbond/command/CreateBondCommand'
import { CreateBondPort } from './CreateBondPort'

@Singleton()
export class CreateBondNestJSEventAdapter implements CreateBondPort, EventListener<BondDeployedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(BondDeployedDLTEvent)
  async handle(event: BondDeployedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CreateBondCommand(
        await ConverterUtils.getHederaAddressFromEvm(event.bondAddress),
        event.bondData.security.erc20MetadataInfo.name,
        event.bondData.security.erc20MetadataInfo.symbol,
        event.bondData.security.erc20MetadataInfo.decimals,
        this.decodeCurrency(event.bondData.bondDetails.currency),
        event.bondData.bondDetails.nominalValue,
        new Date(Number(event.bondData.bondDetails.startingDate) * 1000),
        new Date(Number(event.bondData.bondDetails.maturityDate) * 1000),
        event.bondData.security.maxSupply,
        event.bondData.security.erc20MetadataInfo.isin,
      ),
    )
  }

  private decodeCurrency(hexCurrency: string): string {
    const hex = hexCurrency.slice(2)
    let result = ''
    for (let i = 0; i < hex.length; i += 2) {
      const byte = parseInt(hex.slice(i, i + 2), 16)
      if (!isNaN(byte) && byte > 0) {
        result += String.fromCharCode(byte)
      }
    }
    return result.replace(/\0/g, '').trim()
  }
}
