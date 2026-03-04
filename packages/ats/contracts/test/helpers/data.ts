// SPDX-License-Identifier: Apache-2.0

import { ethers, toUtf8Bytes, hexlify, parseEther, ZeroAddress } from "ethers";
import hre from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { LATEST_VERSION } from "@hashgraph/asset-tokenization-contracts/scripts";
import { TREASURY_CONFIG_ID } from "@scripts";
import { TREASURY_CONFIG_VERSION } from "@test";

/** Get the latest block timestamp from the local Hardhat network. */
export async function getDltTimestamp(): Promise<number> {
  const block = await hre.ethers.provider.getBlock("latest");
  if (!block) throw new Error("Failed to get latest block");
  return block.timestamp;
}

/** GBP-specific regulation defaults (zeroed-out for permissionless test context). Different from ATS which uses REG_S. */
export const DEFAULT_REGULATION_PARAMS = {
  regulationType: 0,
  regulationSubType: 0,
  countriesControlListType: false,
  listOfCountries: "",
  info: "",
} as const;

/** Build factory regulation data with GBP-specific zeroed defaults. */
export function getRegulationData(params?: Partial<typeof DEFAULT_REGULATION_PARAMS>) {
  return {
    regulationType: params?.regulationType ?? DEFAULT_REGULATION_PARAMS.regulationType,
    regulationSubType: params?.regulationSubType ?? DEFAULT_REGULATION_PARAMS.regulationSubType,
    additionalSecurityData: {
      countriesControlListType: params?.countriesControlListType ?? DEFAULT_REGULATION_PARAMS.countriesControlListType,
      listOfCountries: params?.listOfCountries ?? DEFAULT_REGULATION_PARAMS.listOfCountries,
      info: params?.info ?? DEFAULT_REGULATION_PARAMS.info,
    },
  };
}

export interface TestDataSets {
  validBondData: any;
  validFactoryRegulationData: any;
  validTreasuryData: any;
  validKpiData: any;
  invalidTreasuryData: {
    zeroResolver: any;
    zeroPaymentToken: any;
    zeroEnvironmentalAssetInArray: any;
  };
  invalidKpiData: any;
}

export async function createTestDataSets(fixture: {
  mockResolver: any;
  paymentToken: any;
  environmentalAssetToken1: any;
  environmentalAssetToken2: any;
  admin: HardhatEthersSigner;
  user: HardhatEthersSigner;
  treasuryConfigId?: string;
  treasuryVersion?: number;
}): Promise<TestDataSets> {
  const { mockResolver, paymentToken, environmentalAssetToken1, admin, treasuryConfigId, treasuryVersion } = fixture;

  const treasuryKey = treasuryConfigId || TREASURY_CONFIG_ID;
  const treasuryVer = treasuryVersion || TREASURY_CONFIG_VERSION;

  const now = await getDltTimestamp();

  const resolverAddress = mockResolver.address;
  const paymentTokenAddress = await paymentToken.getAddress();
  const environmentalAssetToken1Address = await environmentalAssetToken1.getAddress();

  const validBondData = {
    security: {
      arePartitionsProtected: false,
      isMultiPartition: false,
      resolver: resolverAddress,
      resolverProxyConfiguration: {
        key: ethers.encodeBytes32String("BOND"),
        version: LATEST_VERSION,
      },
      rbacs: [],
      isControllable: true,
      isWhiteList: true,
      maxSupply: parseEther("10000000"),
      erc20MetadataInfo: {
        name: "Green Bond 2025",
        symbol: "GB2025",
        isin: "US0000000001",
        decimals: 18,
      },
      clearingActive: false,
      internalKycActivated: false,
      externalPauses: [],
      externalControlLists: [],
      externalKycLists: [],
      erc20VotesActivated: false,
      compliance: ZeroAddress,
      identityRegistry: ZeroAddress,
    },
    bondDetails: {
      currency: hexlify(toUtf8Bytes("USD")),
      nominalValue: parseEther("100"),
      nominalValueDecimals: 18,
      startingDate: now,
      maturityDate: now + 365 * 24 * 60 * 60,
    },
    proceedRecipients: [],
    proceedRecipientsData: [],
  };

  const validFactoryRegulationData = getRegulationData();

  const validTreasuryData = {
    resolver: resolverAddress,
    resolverProxyConfiguration: {
      key: treasuryKey,
      version: treasuryVer,
    },
    rbacs: [],
    paymentToken: paymentTokenAddress,
    environmentalAssets: [environmentalAssetToken1Address],
  };

  const validKpiData = {
    admin: admin.address,
    rbacs: [],
  };

  const invalidTreasuryDataZeroResolver = {
    ...validTreasuryData,
    resolver: ZeroAddress,
  };

  const invalidTreasuryDataZeroPaymentToken = {
    ...validTreasuryData,
    paymentToken: ZeroAddress,
  };

  const invalidTreasuryDataZeroEnvironmentalAsset = {
    ...validTreasuryData,
    environmentalAssets: [environmentalAssetToken1Address, ZeroAddress],
  };

  const invalidKpiData = {
    ...validKpiData,
    admin: ZeroAddress,
  };

  return {
    validBondData,
    validFactoryRegulationData,
    validTreasuryData,
    validKpiData,
    invalidTreasuryData: {
      zeroResolver: invalidTreasuryDataZeroResolver,
      zeroPaymentToken: invalidTreasuryDataZeroPaymentToken,
      zeroEnvironmentalAssetInArray: invalidTreasuryDataZeroEnvironmentalAsset,
    },
    invalidKpiData,
  };
}

export function createTreasuryDataWithMultipleEnvironmentalAssets(
  validTreasuryData: any,
  environmentalAssetAddresses: string[],
) {
  return {
    ...validTreasuryData,
    environmentalAssets: environmentalAssetAddresses,
  };
}

export function createTreasuryDataWithEmptyEnvironmentalAssets(validTreasuryData: any) {
  return {
    ...validTreasuryData,
    environmentalAssets: [],
  };
}

export function createKpiDataWithRoles(validKpiData: any, roles: Array<{ role: string; members: string[] }>) {
  return {
    ...validKpiData,
    rbacs: roles.map((r) => ({
      role: r.role,
      members: r.members,
    })),
  };
}
