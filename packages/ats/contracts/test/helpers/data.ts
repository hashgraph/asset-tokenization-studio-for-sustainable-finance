// SPDX-License-Identifier: Apache-2.0

import { ethers } from "hardhat";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TREASURY_CONFIG_ID } from "@scripts";
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

export function createTestDataSets(fixture: {
  mockResolver: any;
  paymentToken: any;
  erc721Token1: any;
  erc721Token2: any;
  admin: SignerWithAddress;
  user: SignerWithAddress;
  treasuryConfigId?: string;
  treasuryVersion?: number;
}): TestDataSets {
  const { mockResolver, paymentToken, erc721Token1, erc721Token2, admin, treasuryConfigId, treasuryVersion } = fixture;

  const treasuryKey = treasuryConfigId || TREASURY_CONFIG_ID;
  const treasuryVer = treasuryVersion || TREASURY_CONFIG_VERSION;

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
      maxSupply: ethers.utils.parseEther("10000000"),
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
      compliance: ethers.constants.AddressZero,
      identityRegistry: ethers.constants.AddressZero,
    },
    bondDetails: {
      currency: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("USD")),
      nominalValue: ethers.utils.parseEther("100"),
      startingDate: Math.floor(Date.now() / 1000),
      maturityDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    },
    proceedRecipients: [],
    proceedRecipientsData: [],
  };

  const validFactoryRegulationData = {
    regulationType: 0,
    regulationSubType: 0,
    additionalSecurityData: {
      countriesControlListType: false,
      listOfCountries: "",
      info: "",
    },
  };

  const validTreasuryData = {
    resolver: mockResolver.address,
    resolverProxyConfiguration: {
      key: treasuryKey,
      version: treasuryVer,
    },
    rbacs: [],
    paymentToken: paymentToken.address,
    erc721s: [erc721Token1.address],
  };

  const validKpiData = {
    admin: admin.address,
    rbacs: [],
  };

  const invalidTreasuryDataZeroResolver = {
    ...validTreasuryData,
    resolver: ethers.constants.AddressZero,
  };

  const invalidTreasuryDataZeroPaymentToken = {
    ...validTreasuryData,
    paymentToken: ethers.constants.AddressZero,
  };

  const invalidTreasuryDataZeroErc721 = {
    ...validTreasuryData,
    erc721s: [erc721Token1.address, ethers.constants.AddressZero],
  };

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

export function createTreasuryDataWithMultipleErc721s(validTreasuryData: any, erc721Addresses: string[]) {
  return {
    ...validTreasuryData,
    erc721s: erc721Addresses,
  };
}

export function createTreasuryDataWithEmptyErc721s(validTreasuryData: any) {
  return {
    ...validTreasuryData,
    erc721s: [],
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
