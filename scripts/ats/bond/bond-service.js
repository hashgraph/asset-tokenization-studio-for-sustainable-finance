const { gatewayClient } = require("../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors } = require("../../shared/lib/logger");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");

async function createBond(format, overrides = {}) {
  log(`\n📋 Creating ${format.toUpperCase()} bond...`, colors.bright);
  log(`Using account ID: ${process.env.ACCOUNT_ID}`);

  // Convert ACCOUNT_ID to EVM address
  const accountEvmAddress = await ConverterUtils.getEvmAddressFromHederaAddress(process.env.ACCOUNT_ID);
  logInfo(`Using account EVM address: ${accountEvmAddress}`);
  const defaults = {
    securityTokenToCreate: {
      name: "test",
      symbol: "test",
      isin: "US0378331005",
      decimals: 6,
      isWhiteList: false,
      erc20VotesActivated: false,
      isControllable: true,
      arePartitionsProtected: false,
      isMultiPartition: false,
      clearingActive: false,
      internalKycActivated: false,
      externalPausesAddresses: [],
      externalControlListsAddresses: [],
      externalKycListsAddresses: [],
      diamondOwnerAccountAddress: accountEvmAddress,
      currency: "0x858368",
      numberOfUnits: "1000000",
      nominalValue: "100",
      nominalValueDecimals: 2,
      startingDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now (must be in the future)
      maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      configVersion: 1,
      resolverAddress: process.env.RESOLVER_ADDRESS,
      proceedRecipientAddresses: [],
      proceedRecipientsData: [],
    },
    factoryRegulationData: {
      regulationType: 1,
      regulationSubType: 0,
      isCountryControlListWhiteList: false,
      countries: "CU,KP,IR,SY",
      info: "test",
    },
    treasuryData: {
      resolverAddress: process.env.RESOLVER_ADDRESS,
      configVersion: 1,
      paymentTokenAddress: "0x0000000000000000000000000000000000629238",
      ownerAccountAddress: accountEvmAddress,
      environmentalAssetsAddresses: [],
    },
    kpiData: {
      interestRate: {
        maxRate: "1000",
        baseRate: "500",
        minRate: "100",
        startPeriod: (Math.floor(Date.now() / 1000) + 86400).toString(), // Current timestamp + 1 day
        startRate: "500",
        missedPenalty: "50",
        reportPeriod: (86400 * 30).toString(), // 30 days
        rateDecimals: 2,
      },
      impactData: {
        maxDeviationCap: "150",
        baseLine: "100",
        maxDeviationFloor: "50",
        impactDataDecimals: 2,
        adjustmentPrecision: "100",
      },
    },
    format: format,
    accountId: process.env.ACCOUNT_ID,
    factoryAddress: process.env.FACTORY_ADDRESS,
  };

  const createBondTransactionRequest = mergeDeep(defaults, overrides);
  try {
    const response = await gatewayClient.post("/api/v1/ats/bonds", createBondTransactionRequest);
    console.log("Response data:", response.data);

    logSuccess(`${format.toUpperCase()} bond created successfully!`);
    logInfo(`Symbol: ${createBondTransactionRequest.securityTokenToCreate.symbol}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx}`);

    return { ...createBondTransactionRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create bond: ${error.message}`);
    throw error;
  }
}

function mergeDeep(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target && !(source[key] instanceof Array)) {
      Object.assign(source[key], mergeDeep(target[key], source[key]));
    }
  }
  return { ...target, ...source };
}

module.exports = {
  createBond,
};
