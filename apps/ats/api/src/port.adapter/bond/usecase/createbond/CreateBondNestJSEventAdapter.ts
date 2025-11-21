import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CreateBondCommand } from "@app/bond/createbond/command/CreateBondCommand"
import { CreateBondPort } from "./CreateBondPort"
import { BondSuiteDeployedDLTEvent } from "./model/BondSuiteDeployedDLTEvent"

@Singleton()
export class CreateBondNestJSEventAdapter implements CreateBondPort, EventListener<BondSuiteDeployedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(BondSuiteDeployedDLTEvent)
  async handle(event: BondSuiteDeployedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CreateBondCommand(
        await ConverterUtils.getHederaAddressFromEvm(event.bondAddress),
        await ConverterUtils.getHederaAddressFromEvm(event.treasuryAddress),
        await ConverterUtils.getHederaAddressFromEvm(event.kpiAddress),
        event.bondData.security.erc20MetadataInfo.name,
        event.bondData.security.erc20MetadataInfo.symbol,
        event.bondData.security.erc20MetadataInfo.decimals,
        this.decodeCurrency(event.bondData.bondDetails.currency),
        event.bondData.bondDetails.nominalValue,
        event.bondData.bondDetails.nominalValueDecimals,
        new Date(Number(event.bondData.bondDetails.startingDate) * 1000),
        new Date(Number(event.bondData.bondDetails.maturityDate) * 1000),
        event.bondData.security.maxSupply,
        event.bondData.security.erc20MetadataInfo.isin,
      ),
    )
  }

  private decodeCurrency(hexCurrency: string): string {
    const hex = hexCurrency.startsWith("0x") ? hexCurrency.slice(2) : hexCurrency
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)))
    return Array.from(bytes)
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ""))
      .join("")
      .trim()
  }
}
