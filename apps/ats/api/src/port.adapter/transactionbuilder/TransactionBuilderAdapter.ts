// SPDX-License-Identifier: Apache-2.0
import {
  BaseTransactionBuilder,
  BuildTransactionResponse,
  Environment,
  Singleton,
} from "@hashgraph/green-bonds-shared-core"
import { IERC1643__factory, IFactory__factory } from "@hashgraph/asset-tokenization-contracts"
import { ConfigService } from "@nestjs/config"
import { BuildCreateBondTransactionRequest } from "./model/BuildCreateBondTransactionRequest"
import { TransactionBuilderPort } from "./TransactionBuilderPort"
import { BuildSetBondDocumentTransactionRequest } from "@port/transactionbuilder/model/BuildSetBondDocumentTransactionRequest"
import { BuildRemoveBondDocumentTransactionRequest } from "@port/transactionbuilder/model/BuildRemoveBondDocumentTransactionRequest"

@Singleton()
export class TransactionBuilderAdapter extends BaseTransactionBuilder implements TransactionBuilderPort {
  private readonly GAS = 15_000_000
  private readonly DOCUMENT_TRANSACTIONS_GAS = 300_000
  private readonly EVM_ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
  private readonly DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"
  private readonly DOCUMENTER_ROLE = "0x83ace103a76d3729b4ba1350ad27522bbcda9a1a589d1e5091f443e76abccf41"

  constructor(private readonly configService: ConfigService) {
    super()
  }

  async createBondTransaction(req: BuildCreateBondTransactionRequest): Promise<BuildTransactionResponse> {
    //TODO change for the correct Suite Bond Factory when deployed
    const contractInterface = IFactory__factory.createInterface()

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
          {
            role: this.DOCUMENTER_ROLE,
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
        firstCouponDate: "1970997600",
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

    return await this.buildAndReturnTransactionResponse(
      contractInterface,
      "deployBond",
      req.contractId,
      this.GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [securityTokenToCreate, factoryRegulationData],
    )
  }

  async setBondDocumentTransaction(req: BuildSetBondDocumentTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildAndReturnTransactionResponse(
      IERC1643__factory.createInterface(),
      "setDocument",
      req.contractId,
      this.DOCUMENT_TRANSACTIONS_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [req.name, req.uri, req.hash],
    )
  }

  async removeBondDocumentTransaction(
    req: BuildRemoveBondDocumentTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    return await this.buildAndReturnTransactionResponse(
      IERC1643__factory.createInterface(),
      "removeDocument",
      req.contractId,
      this.DOCUMENT_TRANSACTIONS_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [req.name],
    )
  }

  private async buildAndReturnTransactionResponse(
    contractInterface: any,
    functionName: string,
    contractId: string,
    gas: number,
    account: any,
    format: "hedera" | "ethereum",
    args: any[],
  ): Promise<BuildTransactionResponse> {
    const environment = this.configService.get<Environment>("HEDERA_NETWORK") || "testnet"

    const transactionResponse = await this.buildAndSerializeTransaction({
      contractInterface,
      functionName,
      contractId,
      gas,
      environment,
      account,
      format,
      args,
    } as any)
    return new BuildTransactionResponse(transactionResponse.unsignedTx)
  }
}
