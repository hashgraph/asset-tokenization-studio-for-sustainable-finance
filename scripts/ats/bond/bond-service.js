const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors } = require('../../shared/lib/logger');

async function createBond(format) {
  log(`\n📋 Creating ${format.toUpperCase()} bond...`, colors.bright);
  
  const createBondTransactionRequest = {
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
    diamondOwnerAccountAddress: process.env.ACCOUNT_EVM_ADDRESS,
    currency: "0x858368",
    numberOfUnits: "1000000",
    nominalValue: "100",
    nominalValueDecimals: 2,
    startingDate: "1880997600",
    maturityDate: "1980997600",
    configId: "0x0000000000000000000000000000000000000000000000000000000000000002",
    configVersion: 0,
    resolverAddress: "0x9d88BFbEd510011059ef619f00e8EAAc27D9a683",
    proceedRecipientAddresses: [],
    proceedRecipientsData: []
  },
  factoryRegulationData: {
    regulationType: 1,
    regulationSubType: 0,
    isCountryControlListWhiteList: false,
    countries: "CU,KP,IR,SY",
    info: "test"
  },
  treasuryData: {
    resolverAddress: "0x9d88BFbEd510011059ef619f00e8EAAc27D9a683",
    configId: "0x0000000000000000000000000000000000000000000000000000000000004e20",
    configVersion: 1,
    paymentTokenAddress: "0x0000000000000000000000000000000000629238",
    ownerAccountAddress: process.env.ACCOUNT_EVM_ADDRESS,
    environmentalAssetsAddresses: []
  },
  kpiData: {
    adminAddress: process.env.ACCOUNT_EVM_ADDRESS,
    ownerAccountAddress: process.env.ACCOUNT_EVM_ADDRESS
  },
  format: format,
  accountId: process.env.ACCOUNT_ID,
  factoryAddress: "0x32bc5B65eFf7d3eFc4CC3B62A66c8445E8675982",
  factorySuiteAddress: "0.0.7297384",
};
  
  try {
    const response = await gatewayClient.post('/api/v1/ats/bonds', createBondTransactionRequest);
    console.log('Response data:', response.data);
    
    logSuccess(`${format.toUpperCase()} bond created successfully!`);
    logInfo(`Symbol: ${createBondTransactionRequest.securityTokenToCreate.symbol}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx}`);
    
    return { ...createBondTransactionRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create bond: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createBond
};