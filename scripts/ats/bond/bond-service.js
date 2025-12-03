const { gatewayClient } = require("../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors } = require("../../shared/lib/logger");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");

async function createBond(format, overrides = {}) {
  log(`\n📋 Creating ${format.toUpperCase()} bond...`, colors.bright);

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
      ownerAccountAddress: accountEvmAddress,
      environmentalAssetsAddresses: [],
    },
    kpiData: {
      adminAddress: accountEvmAddress,
      ownerAccountAddress: accountEvmAddress,
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
