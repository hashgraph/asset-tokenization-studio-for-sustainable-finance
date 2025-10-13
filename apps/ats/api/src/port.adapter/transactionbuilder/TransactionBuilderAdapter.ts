import {
  BaseTransactionBuilder,
  BuildTransactionResponse,
  Environment,
  Singleton,
} from "@hashgraph/green-bonds-shared-core"
import { IFactory__factory } from "@hashgraph/asset-tokenization-contracts"
import { ConfigService } from "@nestjs/config"
import { BuildCreateBondTransactionRequest } from "./model/BuildCreateBondTransactionRequest"
import { TransactionBuilderPort } from "./TransactionBuilderPort"

@Singleton()
export class TransactionBuilderAdapter extends BaseTransactionBuilder implements TransactionBuilderPort {
  private readonly GAS = 15_000_000
  private readonly EVM_ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
  private readonly DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"

  constructor(private readonly configService: ConfigService) {
    super()
  }

  createBondTransaction(req: BuildCreateBondTransactionRequest): BuildTransactionResponse {
    //TODO change for the correct Suite Bond Factory when deployed
    const contractInterface = IFactory__factory.createInterface()

    const environment = this.configService.get<Environment>("HEDERA_NETWORK") || "testnet"

    const securityTokenToCreate = {
      security: {
        arePartitionsProtected: req.securityTokenToCreate.arePartitionsProtected,
        isMultiPartition: req.securityTokenToCreate.isMultiPartition,
        resolver: req.securityTokenToCreate.resolverAddress,
        resolverProxyConfiguration: {
          key: req.securityTokenToCreate.configId,
          version: req.securityTokenToCreate.configVersion,
        },
        rbacs: [
          {
            role: this.DEFAULT_ADMIN_ROLE,
            members: req.securityTokenToCreate.diamondOwnerAccountAddress
              ? [req.securityTokenToCreate.diamondOwnerAccountAddress]
              : [this.EVM_ZERO_ADDRESS],
          },
        ],
        isControllable: req.securityTokenToCreate.isControllable,
        isWhiteList: req.securityTokenToCreate.isWhiteList,
        maxSupply: req.securityTokenToCreate.numberOfUnits ? req.securityTokenToCreate.numberOfUnits : "0",
        erc20VotesActivated: req.securityTokenToCreate.erc20VotesActivated,
        erc20MetadataInfo: {
          name: req.securityTokenToCreate.name,
          symbol: req.securityTokenToCreate.symbol,
          isin: req.securityTokenToCreate.isin,
          decimals: req.securityTokenToCreate.decimals,
        },
        clearingActive: req.securityTokenToCreate.clearingActive,
        internalKycActivated: req.securityTokenToCreate.internalKycActivated,
        externalPauses: req.securityTokenToCreate.externalPausesAddresses?.map((address) => address.toString()) ?? [],
        externalControlLists:
          req.securityTokenToCreate.externalControlListsAddresses?.map((address) => address.toString()) ?? [],
        externalKycLists:
          req.securityTokenToCreate.externalKycListsAddresses?.map((address) => address.toString()) ?? [],
        compliance: req.securityTokenToCreate.complianceAddress
          ? req.securityTokenToCreate.complianceAddress.toString()
          : this.EVM_ZERO_ADDRESS,
        identityRegistry: req.securityTokenToCreate.identityRegistryAddress
          ? req.securityTokenToCreate.identityRegistryAddress.toString()
          : this.EVM_ZERO_ADDRESS,
      },
      bondDetails: {
        currency: req.securityTokenToCreate.currency,
        nominalValue: req.securityTokenToCreate.nominalValue ? req.securityTokenToCreate.nominalValue : "0",
        startingDate: parseInt(req.securityTokenToCreate.startingDate).toString(),
        maturityDate: parseInt(req.securityTokenToCreate.maturityDate).toString(),
      },
      //TODO remove this when contracts are updated
      couponDetails: {
        couponFrequency: "2592000",
        couponRate: "1000",
        firstCouponDate: "1761692400",
      },
      // proceedRecipients: req.securityTokenToCreate.proceedRecipientAddresses?.map((addr) => addr.toString()) ?? [],
      // proceedRecipientsData:
      //   req.securityTokenToCreate.proceedRecipientsData?.map((data) => (data === "" ? "0x" : data)) ?? [],
    }

    const factoryRegulationData = {
      regulationType: req.factoryRegulationData.regulationType,
      regulationSubType: req.factoryRegulationData.regulationSubType,
      additionalSecurityData: {
        countriesControlListType: req.factoryRegulationData.isCountryControlListWhiteList,
        listOfCountries: req.factoryRegulationData.countries ?? "",
        info: req.factoryRegulationData.info ?? "",
      },
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const treasuryData = {
      resolver: req.treasuryData.resolverAddress,
      resolverProxyConfiguration: {
        key: req.treasuryData.configId,
        version: req.treasuryData.configVersion,
      },
      rbacs: [
        {
          role: this.DEFAULT_ADMIN_ROLE,
          members: req.treasuryData.ownerAccountAddress
            ? [req.treasuryData.ownerAccountAddress]
            : [this.EVM_ZERO_ADDRESS],
        },
      ],
      paymentToken: req.treasuryData.paymentTokenAddress,
      erc721s: req.treasuryData.erc721Addresses,
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const kpiData = {
      admin: req.kpiData.adminAddress,
      rbacs: [
        {
          role: this.DEFAULT_ADMIN_ROLE,
          members: req.kpiData.ownerAccountAddress ? [req.kpiData.ownerAccountAddress] : [this.EVM_ZERO_ADDRESS],
        },
      ],
    }

    const transactionResponse = this.buildAndSerializeTransaction({
      contractInterface,
      functionName: "deployBond" as any,
      contractId: req.contractId,
      gas: this.GAS,
      environment,
      account: req.accountId,
      format: req.format as "hedera" | "ethereum",
      args: [securityTokenToCreate, factoryRegulationData],
    } as any)

    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }
}
