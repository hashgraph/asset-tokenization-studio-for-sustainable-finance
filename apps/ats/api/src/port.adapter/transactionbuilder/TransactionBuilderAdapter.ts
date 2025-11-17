// SPDX-License-Identifier: Apache-2.0
import {
  BaseTransactionBuilder,
  BuildTransactionResponse,
  ConverterUtils,
  Environment,
  Singleton,
} from "@hashgraph/green-bonds-shared-core"
import {
  IBond__factory,
  ICap__factory,
  IControlList__factory,
  IERC1410__factory,
  IERC1643__factory,
  ILock__factory,
  IProceedRecipients__factory,
  IClearingHoldCreation__factory,
  IClearingActions__factory,
} from "@hashgraph/asset-tokenization-contracts"
import { IFactorySuite__factory } from "@hashgraph/green-bonds-platform-ats-contracts"
import { ConfigService } from "@nestjs/config"
import { BuildCreateBondTransactionRequest } from "./model/BuildCreateBondTransactionRequest"
import { TransactionBuilderPort } from "./TransactionBuilderPort"
import { BuildSetBondDocumentTransactionRequest } from "@port/transactionbuilder/model/BuildSetBondDocumentTransactionRequest"
import { BuildSetBondCapTransactionRequest } from "@port/transactionbuilder/model/BuildSetBondCapTransactionRequest"
import { BuildRemoveBondDocumentTransactionRequest } from "@port/transactionbuilder/model/BuildRemoveBondDocumentTransactionRequest"
import { BuildAddControlListMemberTransactionRequest } from "@port/transactionbuilder/model/BuildAddControlListMemberTransactionRequest"
import { BuildRemoveControlListMemberTransactionRequest } from "@port/transactionbuilder/model/BuildRemoveControlListMemberTransactionRequest"
import { BuildSetCouponTransactionRequest } from "@port/transactionbuilder/model/BuildSetCouponTransactionRequest"
import { BuildCreateBondLockTransactionRequest } from "@port/transactionbuilder/model/BuildCreateBondLockTransactionRequest"
import { BuildMintBondTransactionRequest } from "@port/transactionbuilder/model/BuildMintBondTransactionRequest"
import { BuildReleaseBondLockTransactionRequest } from "@port/transactionbuilder/model/BuildReleaseBondLockTransactionRequest"
import { BuildCreateClearingHoldTransactionRequest } from "@port/transactionbuilder/model/BuildCreateClearingHoldTransactionRequest"
import { BuildApproveClearingHoldTransactionRequest } from "@port/transactionbuilder/model/BuildApproveClearingHoldTransactionRequest"
import { BuildCancelClearingHoldTransactionRequest } from "@port/transactionbuilder/model/BuildCancelClearingHoldTransactionRequest"
import { BuildReclaimClearingHoldTransactionRequest } from "@port/transactionbuilder/model/BuildReclaimClearingHoldTransactionRequest"
import { BuildAddProceedRecipientTransactionRequest } from "@port/transactionbuilder/model/BuildAddProceedRecipientTransactionRequest"
import { BuildRemoveProceedRecipientTransactionRequest } from "@port/transactionbuilder/model/BuildRemoveProceedRecipientTransactionRequest"
import { BuildTransferByPartitionTransactionRequest } from "@port/transactionbuilder/model/BuildTransferByPartitionTransactionRequest"
import { BuildRedeemBondTransactionRequest } from "@port/transactionbuilder/model/BuildRedeemBondTransactionRequest"
import { BuildCreateClearingTransactionRequest } from "@port/transactionbuilder/model/BuildCreateClearingTransactionRequest"
import { BuildApproveClearingTransactionRequest } from "@port/transactionbuilder/model/BuildApproveClearingTransactionRequest"
import { BuildCancelClearingTransactionRequest } from "@port/transactionbuilder/model/BuildCancelClearingTransactionRequest"
import { BuildReclaimClearingTransactionRequest } from "@port/transactionbuilder/model/BuildReclaimClearingTransactionRequest"
import { BuildApproveClearingTransactionRequest } from "@port/transactionbuilder/model/BuildApproveClearingTransactionRequest"
import { BuildCancelClearingTransactionRequest } from "@port/transactionbuilder/model/BuildCancelClearingTransactionRequest"
import { BuildReclaimClearingTransactionRequest } from "@port/transactionbuilder/model/BuildReclaimClearingTransactionRequest"

@Singleton()
export class TransactionBuilderAdapter extends BaseTransactionBuilder implements TransactionBuilderPort {
  private readonly TRANSACTIONS_HIGH_GAS = 15_000_000
  private readonly TRANSACTIONS_MEDIUM_GAS = 700_000
  private readonly TRANSACTIONS_LOW_GAS = 300_000
  private readonly EVM_ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
  private readonly DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"
  private readonly DOCUMENTER_ROLE = "0x83ace103a76d3729b4ba1350ad27522bbcda9a1a589d1e5091f443e76abccf41"
  private readonly CONTROL_LIST_ROLE = "0xca537e1c88c9f52dc5692c96c482841c3bea25aafc5f3bfe96f645b5f800cac3"
  private readonly CORPORATE_ACTION_ROLE = "0x8a139eeb747b9809192ae3de1b88acfd2568c15241a5c4f85db0443a536d77d6"
  private readonly LOCKER_ROLE = "0xd8aa8c6f92fe8ac3f3c0f88216e25f7c08b3a6c374b4452a04d200c29786ce88"
  private readonly ISSUER_ROLE = "0x4be32e8849414d19186807008dabd451c1d87dae5f8e22f32f5ce94d486da842"

  private readonly DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001"

  constructor(private readonly configService: ConfigService) {
    super()
  }

  async createBondTransaction(req: BuildCreateBondTransactionRequest): Promise<BuildTransactionResponse> {
    const contractInterface = IFactorySuite__factory.createInterface()

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
          {
            role: this.CONTROL_LIST_ROLE,
            members: req.securityTokenToCreate.diamondOwnerAccountAddress
              ? [req.securityTokenToCreate.diamondOwnerAccountAddress]
              : [this.EVM_ZERO_ADDRESS],
          },
          {
            role: this.CORPORATE_ACTION_ROLE,
            members: req.securityTokenToCreate.diamondOwnerAccountAddress
              ? [req.securityTokenToCreate.diamondOwnerAccountAddress]
              : [this.EVM_ZERO_ADDRESS],
          },
          {
            role: this.LOCKER_ROLE,
            members: req.securityTokenToCreate.diamondOwnerAccountAddress
              ? [req.securityTokenToCreate.diamondOwnerAccountAddress]
              : [this.EVM_ZERO_ADDRESS],
          },
          {
            role: this.ISSUER_ROLE,
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
      proceedRecipients: req.securityTokenToCreate.proceedRecipientAddresses?.map((addr) => addr.toString()) ?? [],
      proceedRecipientsData:
        req.securityTokenToCreate.proceedRecipientsData?.map((data) => (data === "" ? "0x" : data)) ?? [],
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
      environmentalAssets: req.treasuryData.environmentalAssetsAddresses,
    }

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
      "deployBondSuite",
      req.contractId,
      this.TRANSACTIONS_HIGH_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [req.factoryAddress, securityTokenToCreate, factoryRegulationData, treasuryData, kpiData],
    )
  }

  async setBondDocumentTransaction(req: BuildSetBondDocumentTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildAndReturnTransactionResponse(
      IERC1643__factory.createInterface(),
      "setDocument",
      req.contractId,
      this.TRANSACTIONS_LOW_GAS,
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
      this.TRANSACTIONS_LOW_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [req.name],
    )
  }

  async setBondCapTransaction(req: BuildSetBondCapTransactionRequest): Promise<BuildTransactionResponse> {
    return await this.buildAndReturnTransactionResponse(
      ICap__factory.createInterface(),
      "setMaxSupply",
      req.contractId,
      this.TRANSACTIONS_LOW_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [req.newMaxSupply],
    )
  }

  async addControlListMemberTransaction(
    req: BuildAddControlListMemberTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    return await this.buildAndReturnTransactionResponse(
      IControlList__factory.createInterface(),
      "addToControlList",
      req.contractId,
      this.TRANSACTIONS_LOW_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [req.holderAccountId],
    )
  }

  async removeControlListMemberTransaction(
    req: BuildRemoveControlListMemberTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    return await this.buildAndReturnTransactionResponse(
      IControlList__factory.createInterface(),
      "removeFromControlList",
      req.contractId,
      this.TRANSACTIONS_LOW_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [req.holderAccountId],
    )
  }

  async setBondCouponTransaction(req: BuildSetCouponTransactionRequest): Promise<BuildTransactionResponse> {
    const coupon = {
      recordDate: req.recordDate,
      executionDate: req.executionDate,
      rate: req.rate,
      rateDecimals: req.rateDecimals,
      period: req.period,
    }

    return await this.buildAndReturnTransactionResponse(
      IBond__factory.createInterface(),
      "setCoupon",
      req.contractId,
      this.TRANSACTIONS_MEDIUM_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [coupon],
    )
  }

  async createBondLockTransaction(req: BuildCreateBondLockTransactionRequest): Promise<BuildTransactionResponse> {
    const partition = req.partition ?? this.DEFAULT_PARTITION

    return await this.buildAndReturnTransactionResponse(
      ILock__factory.createInterface(),
      "lockByPartition",
      req.contractId,
      this.TRANSACTIONS_MEDIUM_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [partition, req.amount, req.holderAccountId, req.expirationTimestamp],
    )
  }

  async mintBondTransaction(req: BuildMintBondTransactionRequest): Promise<BuildTransactionResponse> {
    const partition = req.partition ?? this.DEFAULT_PARTITION
    const data = req.data ?? "0x"

    const issueData = {
      partition,
      tokenHolder: await ConverterUtils.getEvmAddressFromHederaAddress(req.holderAccountId),
      value: req.amount,
      data,
    }

    return await this.buildAndReturnTransactionResponse(
      IERC1410__factory.createInterface(),
      "issueByPartition",
      req.contractId,
      this.TRANSACTIONS_MEDIUM_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [issueData],
    )
  }

  async releaseBondLockTransaction(req: BuildReleaseBondLockTransactionRequest): Promise<BuildTransactionResponse> {
    const partition = req.partition ?? this.DEFAULT_PARTITION

    return await this.buildAndReturnTransactionResponse(
      ILock__factory.createInterface(),
      "releaseByPartition",
      req.contractId,
      this.TRANSACTIONS_MEDIUM_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [partition, req.lockId, req.holderAccountId],
    )
  }

  async addProceedRecipientTransaction(
    req: BuildAddProceedRecipientTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    const data = req.data ?? "0x"

    return await this.buildAndReturnTransactionResponse(
      IProceedRecipients__factory.createInterface(),
      "addProceedRecipient",
      req.contractId,
      this.TRANSACTIONS_LOW_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [req.proceedRecipientAddress, data],
    )
  }

  async removeProceedRecipientTransaction(
    req: BuildRemoveProceedRecipientTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    return await this.buildAndReturnTransactionResponse(
      IProceedRecipients__factory.createInterface(),
      "removeProceedRecipient",
      req.contractId,
      this.TRANSACTIONS_LOW_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [req.proceedRecipientAddress],
    )
  }

  async transferByPartitionTransaction(
    req: BuildTransferByPartitionTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    const partition = req.partition ?? this.DEFAULT_PARTITION
    const data = req.data ?? "0x"

    const basicTransferInfo = {
      to: await ConverterUtils.getEvmAddressFromHederaAddress(req.toAccountId),
      value: req.amount,
    }

    return await this.buildAndReturnTransactionResponse(
      IERC1410__factory.createInterface(),
      "transferByPartition",
      req.contractId,
      this.TRANSACTIONS_MEDIUM_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [partition, basicTransferInfo, data],
    )
  }

  async redeemBondTransaction(req: BuildRedeemBondTransactionRequest): Promise<BuildTransactionResponse> {
    const partition = req.partition ?? this.DEFAULT_PARTITION
    const data = req.data ?? "0x"

    return await this.buildAndReturnTransactionResponse(
      IERC1410__factory.createInterface(),
      "redeemByPartition",
      req.contractId,
      this.TRANSACTIONS_MEDIUM_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [partition, req.amount, data],
    )
  }

  async createClearingHoldTransaction(
    req: BuildCreateClearingHoldTransactionRequest,
  ): Promise<BuildTransactionResponse> {
    const partition = req.partition || this.DEFAULT_PARTITION

    const contractInterface = IClearingHoldCreation__factory.createInterface()

    const clearingOperationFrom = {
      clearingOperation: {
        partition: partition,
        expirationTimestamp: req.expirationTimestamp,
        data: req.data || "0x",
      },
      from: await ConverterUtils.getEvmAddressFromHederaAddress(req.holderAccountId),
      operatorData: "0x",
    }

    const hold = {
      amount: req.amount,
      expirationTimestamp: req.expirationTimestamp,
      escrow: req.escrowAddress,
      to: req.toAddress || this.EVM_ZERO_ADDRESS,
      data: req.data || "0x",
    }

    return await this.buildAndReturnTransactionResponse(
      contractInterface,
      "clearingCreateHoldFromByPartition",
      req.contractId,
      this.TRANSACTIONS_MEDIUM_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [clearingOperationFrom, hold],
    )
  }

  async approveClearingTransaction(req: BuildApproveClearingTransactionRequest): Promise<BuildTransactionResponse> {
    const partition = req.partition || this.DEFAULT_PARTITION

    const clearingOperationIdentifier = {
      clearingOperationType: req.operationType,
      partition: partition,
      tokenHolder: await ConverterUtils.getEvmAddressFromHederaAddress(req.holderAccountId),
      clearingId: req.clearingId,
    }

    return await this.buildAndReturnTransactionResponse(
      IClearingActions__factory.createInterface(),
      "approveClearingOperationByPartition",
      req.contractId,
      this.TRANSACTIONS_MEDIUM_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [clearingOperationIdentifier],
    )
  }

  async cancelClearingTransaction(req: BuildCancelClearingTransactionRequest): Promise<BuildTransactionResponse> {
    const partition = req.partition || this.DEFAULT_PARTITION

    const clearingOperationIdentifier = {
      clearingOperationType: req.operationType,
      partition: partition,
      tokenHolder: await ConverterUtils.getEvmAddressFromHederaAddress(req.holderAccountId),
      clearingId: req.clearingId,
    }

    return await this.buildAndReturnTransactionResponse(
      IClearingActions__factory.createInterface(),
      "cancelClearingOperationByPartition",
      req.contractId,
      this.TRANSACTIONS_MEDIUM_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [clearingOperationIdentifier],
    )
  }

  async reclaimClearingTransaction(req: BuildReclaimClearingTransactionRequest): Promise<BuildTransactionResponse> {
    const partition = req.partition || this.DEFAULT_PARTITION

    const clearingOperationIdentifier = {
      clearingOperationType: req.operationType,
      partition: partition,
      tokenHolder: await ConverterUtils.getEvmAddressFromHederaAddress(req.holderAccountId),
      clearingId: req.clearingId,
    }

    return await this.buildAndReturnTransactionResponse(
      IClearingActions__factory.createInterface(),
      "reclaimClearingOperationByPartition",
      req.contractId,
      this.TRANSACTIONS_MEDIUM_GAS,
      req.accountId,
      req.format as "hedera" | "ethereum",
      [clearingOperationIdentifier],
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
