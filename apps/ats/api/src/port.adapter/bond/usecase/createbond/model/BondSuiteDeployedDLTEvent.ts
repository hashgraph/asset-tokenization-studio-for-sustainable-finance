import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export class BondSuiteDeployedDLTEvent extends DLTEvent {
  readonly operator: string
  readonly bondAddress: string
  readonly treasuryAddress: string
  readonly bondKpiData: BondKpiLinkedRateData
  readonly treasuryData: TreasuryData

  constructor(
    bondContractId: string,
    transactionHash: string,
    operator: string,
    bondAddress: string,
    treasuryAddress: string,
    bondKpiData: BondKpiLinkedRateData,
    treasuryData: TreasuryData,
  ) {
    super(bondContractId, transactionHash)
    this.operator = operator
    this.bondAddress = bondAddress
    this.treasuryAddress = treasuryAddress
    this.bondKpiData = bondKpiData
    this.treasuryData = treasuryData
  }
}

interface TreasuryData {
  resolver: string
  resolverProxyConfiguration: ResolverProxyConfiguration
  rbacs: Rbac[]
  paymentToken: string
  environmentalAssets: string[]
}

interface BondKpiLinkedRateData {
  bondData: BondData
  factoryRegulationData: FactoryRegulationData
  interestRate: InterestRate
  impactData: ImpactData
}

interface InterestRate {
  maxRate: string
  baseRate: string
  minRate: string
  startPeriod: string
  startRate: string
  missedPenalty: string
  reportPeriod: string
  rateDecimals: number
}

interface ImpactData {
  maxDeviationCap: string
  baseLine: string
  maxDeviationFloor: string
  impactDataDecimals: number
  adjustmentPrecision: string
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
  nominalValueDecimals: number
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
