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
        await ConverterUtils.getHederaAddressFromEvm(event.bondAddress), // TODO: Replace with treasuryId when the Treasury contract is deployed
        await ConverterUtils.getHederaAddressFromEvm(event.bondAddress), // TODO: Replace with kpiId when the KPI contract is deployed
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
    const hex = hexCurrency.startsWith('0x') ? hexCurrency.slice(2) : hexCurrency
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)))
    return Array.from(bytes)
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ''))
      .join('')
      .trim()
  }
}
