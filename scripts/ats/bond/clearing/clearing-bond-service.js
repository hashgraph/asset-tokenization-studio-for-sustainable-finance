const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors } = require("../../../shared/lib/logger");

async function createClearingBond(format) {
  log(`\n📋 Creating ${format.toUpperCase()} bond with clearing enabled...`, colors.bright);

  const createBondTransactionRequest = {
    securityTokenToCreate: {
      name: "test-clearing",
      symbol: "TESTCLR",
      isin: "US0378331005",
      decimals: 6,
      isWhiteList: false,
      erc20VotesActivated: false,
      isControllable: true,
      arePartitionsProtected: false,
      isMultiPartition: false,
      clearingActive: true,
      internalKycActivated: false,
      externalPausesAddresses: [],
      externalControlListsAddresses: [],
      externalKycListsAddresses: [],
      diamondOwnerAccountAddress: process.env.ACCOUNT_EVM_ADDRESS,
      currency: "0x858368",
      numberOfUnits: "1000000",
      nominalValue: "100",
      nominalValueDecimals: 2,
      startingDate: new Date(1880997600000),
      maturityDate: new Date(1980997600000),
      configVersion: 0,
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
      ownerAccountAddress: process.env.ACCOUNT_EVM_ADDRESS,
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

  try {
    const response = await gatewayClient.post("/api/v1/ats/bonds", createBondTransactionRequest);
    console.log("Response data:", response.data);

    logSuccess(`${format.toUpperCase()} bond with clearing enabled created successfully!`);
    logInfo(`Symbol: ${createBondTransactionRequest.securityTokenToCreate.symbol}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx}`);

    return { ...createBondTransactionRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create bond: ${error.message}`);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

module.exports = {
  createClearingBond,
};
