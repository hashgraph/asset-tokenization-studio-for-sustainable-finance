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
    const bondHederaAddress = await ConverterUtils.getHederaAddressFromEvm(event.bondAddress)

    await this.commandBus.execute(
      new CreateBondCommand(
        bondHederaAddress, // contractId
        await ConverterUtils.getHederaAddressFromEvm(event.treasuryAddress), // treasuryId
        event.bondKpiData.bondData.security.erc20MetadataInfo.name,
        event.bondKpiData.bondData.security.erc20MetadataInfo.symbol,
        event.bondKpiData.bondData.security.erc20MetadataInfo.decimals,
        this.decodeCurrency(event.bondKpiData.bondData.bondDetails.currency),
        event.bondKpiData.bondData.bondDetails.nominalValue,
        event.bondKpiData.bondData.bondDetails.nominalValueDecimals,
        new Date(Number(event.bondKpiData.bondData.bondDetails.startingDate) * 1000),
        new Date(Number(event.bondKpiData.bondData.bondDetails.maturityDate) * 1000),
        event.bondKpiData.bondData.security.maxSupply,
        event.bondKpiData.bondData.security.erc20MetadataInfo.isin,
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
