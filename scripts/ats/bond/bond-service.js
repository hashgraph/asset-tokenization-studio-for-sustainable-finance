const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors } = require('../../shared/lib/logger');
const { ConverterUtils } = require('@hashgraph/green-bonds-shared-core');

async function createBond(format) {
  log(`\n📋 Creating ${format.toUpperCase()} bond...`, colors.bright);

  // Convert ACCOUNT_ID to EVM address
  const accountEvmAddress = await ConverterUtils.getEvmAddressFromHederaAddress(process.env.ACCOUNT_ID);
  logInfo(`Using account EVM address: ${accountEvmAddress}`);

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
    diamondOwnerAccountAddress: accountEvmAddress,
    currency: "0x858368",
    numberOfUnits: "1000000",
    nominalValue: "100",
    nominalValueDecimals: 2,
    startingDate: new Date(1880997600000),
    maturityDate: new Date(1980997600000),
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
    configVersion: 1,
    paymentTokenAddress: "0x0000000000000000000000000000000000629238",
    ownerAccountAddress: accountEvmAddress,
    environmentalAssetsAddresses: []
  },
  kpiData: {
    adminAddress: accountEvmAddress,
    ownerAccountAddress: accountEvmAddress
  },
  format: format,
  accountId: process.env.ACCOUNT_ID,
  factoryAddress: "0x32bc5B65eFf7d3eFc4CC3B62A66c8445E8675982",
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