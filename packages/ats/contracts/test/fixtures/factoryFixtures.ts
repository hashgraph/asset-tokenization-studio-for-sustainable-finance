import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { FactorySuiteFacet, MockAtsFactory, MockBusinessLogicResolver, MockERC20, MockERC721 } from "@contracts/index";

export interface FactoryFixtureAccounts {
  deployer: SignerWithAddress;
  admin: SignerWithAddress;
  user: SignerWithAddress;
  unauthorized: SignerWithAddress;
}

export interface FactoryFixtureContracts {
  factorySuiteFacet: FactorySuiteFacet;
  mockAtsFactory: MockAtsFactory;
  mockResolver: MockBusinessLogicResolver;
  paymentToken: MockERC20;
  erc721Token1: MockERC721;
  erc721Token2: MockERC721;
}

export interface FactoryFixture extends FactoryFixtureAccounts, FactoryFixtureContracts {}

export async function deployFactorySuiteFixture(): Promise<FactoryFixture> {
  const [deployer, admin, user, unauthorized] = await ethers.getSigners();

  // Deploy mock contracts
  const MockAtsFactory = await ethers.getContractFactory("MockAtsFactory");
  const mockAtsFactory = await MockAtsFactory.deploy();

  const MockBusinessLogicResolver = await ethers.getContractFactory("MockBusinessLogicResolver");
  const mockResolver = await MockBusinessLogicResolver.deploy();

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const paymentToken = await MockERC20.deploy("Test Token", "TEST");

  const MockERC721 = await ethers.getContractFactory("MockERC721");
  const erc721Token1 = await MockERC721.deploy("Carbon Credits", "CC");
  const erc721Token2 = await MockERC721.deploy("Green Certificates", "GC");

  // Deploy FactorySuiteFacet
  const FactorySuiteFacet = await ethers.getContractFactory("FactorySuiteFacet");
  const factorySuiteFacet = await FactorySuiteFacet.deploy();

  await factorySuiteFacet.deployed();

  // Grant DEPLOYER role to admin
  const DEPLOYER_ROLE = "0x1e30887951e961109b31c3e05261cd69e3d6381327ba40ce9968bbadbebce283";
  await factorySuiteFacet.grantRole(DEPLOYER_ROLE, admin.address);

  return {
    deployer,
    admin,
    user,
    unauthorized,
    factorySuiteFacet,
    mockAtsFactory,
    mockResolver,
    paymentToken,
    erc721Token1,
    erc721Token2,
  };
}

export interface TestDataSets {
  validBondData: any;
  validFactoryRegulationData: any;
  validTreasuryData: any;
  validKpiData: any;
  invalidTreasuryData: any;
  invalidKpiData: any;
}

export function createTestDataSets(fixture: FactoryFixture): TestDataSets {
  const { mockResolver, paymentToken, erc721Token1, erc721Token2, admin } = fixture;

  const validBondData = {
    name: "Green Bond",
    symbol: "GB",
    currency: "USD",
    decimals: 18,
    maxSupply: ethers.utils.parseEther("1000000"),
    bondData: {
      maturityDate: Math.floor(Date.now() / 1000) + 31536000, // 1 year from now
      couponRate: 500, // 5%
      couponType: 0, // Fixed rate
      couponFrequency: 4, // Quarterly
    },
  };

  const validFactoryRegulationData = {
    isRegulated: true,
    kycRequired: true,
    amlRequired: true,
    sanctionsRequired: false,
  };

  const validTreasuryData = {
    resolver: mockResolver.address,
    resolverProxyConfiguration: {
      resolverAddress: mockResolver.address,
      version: 1,
    },
    rbacs: [
      {
        role: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TREASURY_ADMIN")),
        account: admin.address,
      },
    ],
    paymentToken: paymentToken.address,
    erc721s: [erc721Token1.address, erc721Token2.address],
  };

  const validKpiData = {
    admin: admin.address,
    rbacs: [
      {
        role: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("KPI_ORACLE")),
        account: admin.address,
      },
    ],
  };

  // Invalid data sets for negative testing
  const invalidTreasuryData = {
    resolver: ethers.constants.AddressZero, // Invalid - zero address
    resolverProxyConfiguration: {
      resolverAddress: ethers.constants.AddressZero,
      version: 1,
    },
    rbacs: [],
    paymentToken: ethers.constants.AddressZero, // Invalid - zero address
    erc721s: [], // Empty array is now valid
  };

  const invalidKpiData = {
    admin: ethers.constants.AddressZero, // Invalid - zero address
    rbacs: [],
  };

  return {
    validBondData,
    validFactoryRegulationData,
    validTreasuryData,
    validKpiData,
    invalidTreasuryData,
    invalidKpiData,
  };
}
