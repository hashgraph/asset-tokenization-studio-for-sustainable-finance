import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class BondDeployedDLTEvent extends DLTEvent {
  readonly deployer: string
  readonly bondAddress: string
  readonly bondData: BondData
  readonly regulationData: FactoryRegulationData

  constructor(
    contractId: string,
    transactionHash: string,
    deployer: string,
    bondAddress: string,
    bondData: BondData,
    regulationData: FactoryRegulationData,
  ) {
    super(contractId, transactionHash)
    this.deployer = deployer
    this.bondAddress = bondAddress
    this.bondData = bondData
    this.regulationData = regulationData
  }
}

//TODO: Uncomment and use when the Treasury and KPI contracts are deployed
// export class BondDeployedDLTEvent extends DLTEvent {
//   readonly operator: string
//   readonly bondAddress: string
//   readonly treasuryAddress: string
//   readonly kpiAddress: string
//   readonly bondData: BondData
//   readonly regulationData: FactoryRegulationData
//   readonly treasuryData: TreasuryData
//   readonly kpiData: KpiData

//   constructor(
//     contractId: string,
//     transactionHash: string,
//     operator: string,
//     bondAddress: string,
//     treasuryAddress: string,
//     kpiAddress: string,
//     bondData: BondData,
//     regulationData: FactoryRegulationData,
//     treasuryData: TreasuryData,
//     kpiData: KpiData,
//   ) {
//     super(contractId, transactionHash)
//     this.operator = operator
//     this.bondAddress = bondAddress
//     this.treasuryAddress = treasuryAddress
//     this.kpiAddress = kpiAddress
//     this.bondData = bondData
//     this.regulationData = regulationData
//     this.treasuryData = treasuryData
//     this.kpiData = kpiData
//   }
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TreasuryData {
  resolver: string
  resolverProxyConfiguration: ResolverProxyConfiguration
  rbacs: Rbac[]
  paymentToken: string
  erc721s: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface KpiData {
  admin: string
  rbacs: Rbac[]
}

interface BondData {
  security: SecurityData
  bondDetails: BondDetailsData
  proceedRecipients: string[]
  proceedRecipientsData: string[]
}

interface BondDetailsData {
  currency: string
  nominalValue: string
  startingDate: string
  maturityDate: string
}

interface ERC20MetadataInfo {
  name: string
  symbol: string
  isin: string
  decimals: number
}
interface Rbac {
  role: string
  members: string[]
}

interface AdditionalSecurityData {
  countriesControlListType: boolean
  listOfCountries: string
  info: string
}

enum RegulationType {
  NONE = 0,
  REG_S = 1,
  REG_D = 2,
}

enum RegulationSubType {
  NONE = 0,
  REG_D_506_B = 1,
  REG_D_506_C = 2,
}

interface FactoryRegulationData {
  regulationType: RegulationType
  regulationSubType: RegulationSubType
  additionalSecurityData: AdditionalSecurityData
}

interface ResolverProxyConfiguration {
  key: string
  version: string
}

interface SecurityData {
  arePartitionsProtected: boolean
  isMultiPartition: boolean
  resolver: string
  resolverProxyConfiguration: ResolverProxyConfiguration
  rbacs: Rbac[]
  isControllable: boolean
  isWhiteList: boolean
  maxSupply: string
  erc20MetadataInfo: ERC20MetadataInfo
  clearingActive: boolean
  internalKycActivated: boolean
  externalPauses: string[]
  externalControlLists: string[]
  externalKycLists: string[]
  erc20VotesActivated: boolean
  compliance: string
  identityRegistry: string
}
