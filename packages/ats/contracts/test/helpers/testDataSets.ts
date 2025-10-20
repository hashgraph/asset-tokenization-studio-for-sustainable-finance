// SPDX-License-Identifier: Apache-2.0

/**
 * Test data sets helper for FactorySuite tests
 *
 * Provides centralized test data management with valid and invalid test cases.
 * Following 2025 best practice: DRY principle for test data.
 *
 * @module test/helpers/testDataSets
 */

import { ethers } from "hardhat";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TREASURY_CONFIG_ID } from "@scripts/domain";
import { TREASURY_CONFIG_VERSION } from "@test";

export interface TestDataSets {
  validBondData: any;
  validFactoryRegulationData: any;
  validTreasuryData: any;
  validKpiData: any;
  invalidTreasuryData: {
    zeroResolver: any;
    zeroPaymentToken: any;
    zeroErc721InArray: any;
  };
  invalidKpiData: any;
}

/**
 * Create comprehensive test data sets for FactorySuite testing
 * @param fixture - Test fixture containing mocks and signers
 * @returns Structured test data with valid and invalid cases
 */
export function createTestDataSets(fixture: {
  mockResolver: any;
  paymentToken: any;
  erc721Token1: any;
  erc721Token2: any;
  admin: SignerWithAddress;
  user: SignerWithAddress;
  treasuryConfigId?: string; // Optional Treasury config ID (defaults to TREASURY_CONFIG_ID constant)
  treasuryVersion?: number; // Optional Treasury version (defaults to 1)
}): TestDataSets {
  const { mockResolver, paymentToken, erc721Token1, erc721Token2, admin, treasuryConfigId, treasuryVersion } = fixture;

  // Use provided Treasury config ID or the standard Treasury config ID (20000)
  const treasuryKey = treasuryConfigId || TREASURY_CONFIG_ID;
  const treasuryVer = treasuryVersion || TREASURY_CONFIG_VERSION;

  // Valid Bond Data (ATS Factory BondData format - no coupon details)
  // Note: ATS Factory BondData only has security, bondDetails, proceedRecipients, proceedRecipientsData
  // Coupon details are configured separately in the Bond contract after deployment
  const validBondData = {
    security: {
      arePartitionsProtected: false,
      isMultiPartition: false,
      resolver: mockResolver.address,
      resolverProxyConfiguration: {
        key: ethers.utils.formatBytes32String("BOND"),
        version: 1,
      },
      rbacs: [],
      isControllable: true,
      isWhiteList: true,
      maxSupply: ethers.utils.parseEther("10000000"), // 10M max supply
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
      erc20VotesActivated: false, // ERC20Votes extension not activated
      compliance: ethers.constants.AddressZero,
      identityRegistry: ethers.constants.AddressZero,
    },
    bondDetails: {
      currency: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("USD")), // bytes3 (0x555344)
      nominalValue: ethers.utils.parseEther("100"), // $100 par value
      startingDate: Math.floor(Date.now() / 1000),
      maturityDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year from now
    },
    proceedRecipients: [], // No proceed recipients for green bonds (handled via Treasury)
    proceedRecipientsData: [], // No proceed recipients data
  };

  // Valid Factory Regulation Data (ATS format)
  const validFactoryRegulationData = {
    regulationType: 0, // RegulationType.NONE
    regulationSubType: 0, // RegulationSubType.NONE
    additionalSecurityData: {
      countriesControlListType: false,
      listOfCountries: "",
      info: "",
    },
  };

  // Valid Treasury Data
  const validTreasuryData = {
    resolver: mockResolver.address,
    resolverProxyConfiguration: {
      key: treasuryKey, // Use registered Treasury config
      version: treasuryVer,
    },
    rbacs: [],
    paymentToken: paymentToken.address,
    erc721s: [erc721Token1.address],
  };

  // Valid KPI Data
  const validKpiData = {
    admin: admin.address,
    rbacs: [],
  };

  // Invalid Treasury Data - Zero Resolver
  const invalidTreasuryDataZeroResolver = {
    ...validTreasuryData,
    resolver: ethers.constants.AddressZero,
  };

  // Invalid Treasury Data - Zero Payment Token
  const invalidTreasuryDataZeroPaymentToken = {
    ...validTreasuryData,
    paymentToken: ethers.constants.AddressZero,
  };

  // Invalid Treasury Data - Zero Address in ERC721 Array
  const invalidTreasuryDataZeroErc721 = {
    ...validTreasuryData,
    erc721s: [erc721Token1.address, ethers.constants.AddressZero],
  };

  // Invalid KPI Data - Zero Admin
  const invalidKpiData = {
    ...validKpiData,
    admin: ethers.constants.AddressZero,
  };

  return {
    validBondData,
    validFactoryRegulationData,
    validTreasuryData,
    validKpiData,
    invalidTreasuryData: {
      zeroResolver: invalidTreasuryDataZeroResolver,
      zeroPaymentToken: invalidTreasuryDataZeroPaymentToken,
      zeroErc721InArray: invalidTreasuryDataZeroErc721,
    },
    invalidKpiData,
  };
}

/**
 * Create treasury data with multiple ERC721 tokens
 * @param validTreasuryData - Base valid treasury data
 * @param erc721Addresses - Array of ERC721 token addresses
 * @returns Treasury data with multiple ERC721 tokens
 */
export function createTreasuryDataWithMultipleErc721s(validTreasuryData: any, erc721Addresses: string[]) {
  return {
    ...validTreasuryData,
    erc721s: erc721Addresses,
  };
}

/**
 * Create treasury data with empty ERC721 array
 * @param validTreasuryData - Base valid treasury data
 * @returns Treasury data with empty ERC721 array
 */
export function createTreasuryDataWithEmptyErc721s(validTreasuryData: any) {
  return {
    ...validTreasuryData,
    erc721s: [],
  };
}

/**
 * Create KPI data with multiple RBAC roles
 * @param validKpiData - Base valid KPI data
 * @param roles - Array of { role, members } objects
 * @returns KPI data with multiple RBAC roles
 */
export function createKpiDataWithRoles(validKpiData: any, roles: Array<{ role: string; members: string[] }>) {
  return {
    ...validKpiData,
    rbacs: roles.map((r) => ({
      role: r.role,
      members: r.members,
    })),
  };
}
