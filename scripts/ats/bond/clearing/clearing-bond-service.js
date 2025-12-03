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
      adminAddress: process.env.ACCOUNT_EVM_ADDRESS,
      ownerAccountAddress: process.env.ACCOUNT_EVM_ADDRESS,
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
