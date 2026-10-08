const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { config } = require("../../../shared/lib/config");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");
const { addControlListMember } = require("../controllist/add-control-list-member");

async function createBondHold(
  format,
  bondContractId,
  holderAccountId,
  partition,
  amount,
  expirationTimestamp,
  escrowAccountId,
  data = "0x",
) {
  logHeader(`📋 Creating Bond Hold in ${format.toUpperCase()} Bond...`);

  // Convert holder Hedera ID to EVM address for the URL path
  const holderEvmAddress = holderAccountId.startsWith("0x")
    ? holderAccountId
    : await ConverterUtils.getEvmAddressFromHederaAddress(holderAccountId);

  logInfo(`Using holder EVM address: ${holderEvmAddress}`);
  logInfo(`Using escrow Account ID: ${escrowAccountId} (will be converted by backend)`);

  const createHoldRequest = {
    partition: partition || undefined,
    amount: amount,
    expirationTimestamp: expirationTimestamp.toISOString(),
    escrowAccountId: escrowAccountId, // Backend will convert this to EVM
    data: data,
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo("Sending create bond hold request to gateway...");
    const endpoint = `/api/v1/ats/bonds/${bondContractId}/holders/${holderEvmAddress}/holds`;
    const response = await gatewayClient.post(endpoint, createHoldRequest);

    logSuccess(`${format.toUpperCase()} Create bond hold transaction created!`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Partition: ${partition}`);
    logInfo(`Amount: ${amount}`);
    logInfo(`Expiration: ${expirationTimestamp.toISOString()}`);
    logInfo(`Escrow Account ID: ${escrowAccountId}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...createHoldRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create bond hold transaction: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Wait for bond deployment by polling the database
 */
async function waitForBondDeployment(maxAttempts = 30, intervalMs = 2000, initialWaitMs = 15000) {
  logInfo(`⏳ Waiting ${initialWaitMs / 1000} seconds for bond deployment transaction to be processed...`);
  await new Promise((resolve) => setTimeout(resolve, initialWaitMs));

  logInfo(`⏳ Now polling database for bond deployment (max ${maxAttempts} attempts, ${intervalMs}ms interval)...`);

  let attempts = 0;
  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await gatewayClient.get("/api/v1/ats/bonds", {
        params: { page: 1, limit: 1, sort: "createdAt,desc" },
      });

      if (response.data?.items && response.data.items.length > 0) {
        const latestBond = response.data.items[0];
        logSuccess(`✅ Bond found in database!`);
        logInfo(`Contract ID: ${latestBond.contractId}`);
        logInfo(`Symbol: ${latestBond.symbol}`);

        // Wait additional time to ensure event filters are registered
        logInfo(`⏳ Waiting additional 5 seconds for event filters to be registered...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        return latestBond;
      }

      logInfo(`Attempt ${attempts}/${maxAttempts} - Bond not yet found in database`);
    } catch (error) {
      logError(`Error during attempt ${attempts}: ${error.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Bond deployment timeout after ${maxAttempts} attempts`);
}

/**
 * Create a bond with whitelist enabled (for hold testing)
 * This is a specialized version that enables whitelist mode
 */
async function createBondWithWhitelist(format) {
  log(`\n📋 Creating ${format.toUpperCase()} bond with whitelist enabled...`, colors.bright);

  // Convert ACCOUNT_ID to EVM address
  const accountEvmAddress = await ConverterUtils.getEvmAddressFromHederaAddress(process.env.ACCOUNT_ID);
  logInfo(`Using account EVM address: ${accountEvmAddress}`);

  const createBondTransactionRequest = {
    securityTokenToCreate: {
      name: "test",
      symbol: "test",
      isin: "US0378331005",
      decimals: 6,
      isWhiteList: true, // WHITELIST MODE - only addresses in control list can receive tokens
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
        startPeriod: (Math.floor(Date.now() / 1000) + 86400).toString(),
        startRate: "500",
        missedPenalty: "50",
        reportPeriod: (86400 * 30).toString(),
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

    logSuccess(`${format.toUpperCase()} bond transaction created with whitelist enabled!`);
    logInfo(`Factory Address: ${response.data.factoryAddress || "N/A"}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...createBondTransactionRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create bond transaction: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Mint tokens to a holder
 */
async function mintBond(format, bondContractId, holderAccountId, partition, amount) {
  logHeader(`🪙 Minting ${amount} tokens to ${holderAccountId}...`);

  const holderEvmAddress = await ConverterUtils.getEvmAddressFromHederaAddress(holderAccountId);

  const mintRequest = {
    partition: partition || undefined,
    amount: amount,
    data: "0x",
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const endpoint = `/api/v1/ats/bonds/${bondContractId}/holders/${holderEvmAddress}/mint`;
    const response = await gatewayClient.post(endpoint, mintRequest);

    logSuccess(`Mint transaction created!`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...mintRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to mint bond: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function main() {
  try {
    logHeader("🚀 CREATE BOND HOLD SCRIPT");
    log("=====================================\n", colors.cyan);

    // Validate configuration
    if (!validateSigningConfig()) {
      process.exit(1);
    }

    if (!process.env.ACCOUNT_ID) {
      logError("ACCOUNT_ID not found in environment variables");
      logInfo("Please set ACCOUNT_ID in your .env file");
      process.exit(1);
    }

    // Get format from environment
    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
    logInfo(`Using ${format.toUpperCase()} blockchain format`);

    // Configuration parameters
    const holderAccountId = process.env.HOLDER_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const partition = process.env.PARTITION || ""; // Empty string = default partition
    const amount = process.env.AMOUNT || "1000"; // Amount to hold
    const mintAmount = process.env.MINT_AMOUNT || "10000"; // Amount to mint (should be > hold amount)
    const expirationMinutes = parseInt(process.env.EXPIRATION_MINUTES || "120"); // Default 2 hours (120 minutes)
    const expirationTimestamp = new Date(Date.now() + expirationMinutes * 60 * 1000);
    const escrowAccountId = process.env.ESCROW_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const data = process.env.DATA || "0x";

    // Step 1: Deploy new bond with whitelist enabled
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 1: DEPLOY BOND (WHITELIST)");
    logHeader("═══════════════════════════════════");

    const deploymentTx = await createBondWithWhitelist(format);
    const signedDeploymentTx = await signTransaction(deploymentTx.unsignedTx);
    logSuccess("Bond deployment transaction signed!");

    await publishSignedTransaction(signedDeploymentTx, {
      description: "Deploy Bond for Hold Testing",
      userAccountId: process.env.ACCOUNT_ID,
    });

    // Wait for deployment and get the contract ID from the database
    const deployedBond = await waitForBondDeployment();
    const bondContractId = deployedBond.contractId;
    logSuccess(`Bond deployed with Contract ID: ${bondContractId}\n`);

    // Step 2: Add holder to control list
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 2: ADD HOLDER TO CONTROL LIST");
    logHeader("═══════════════════════════════════");

    const holderEvmAddress = holderAccountId.startsWith("0x")
      ? holderAccountId
      : await ConverterUtils.getEvmAddressFromHederaAddress(holderAccountId);

    logInfo(`Adding holder to control list: ${holderEvmAddress}`);

    const controlListTx = await addControlListMember(bondContractId, holderEvmAddress, format);
    const signedControlListTx = await signTransaction(controlListTx.unsignedTx);
    logSuccess("Control list transaction signed!");

    await publishSignedTransaction(signedControlListTx, {
      description: "Add Holder to Control List",
      bondContractId: bondContractId,
      holderAccountId: holderAccountId,
    });

    logInfo("⏳ Waiting 20 seconds for control list update to be confirmed on blockchain...");
    await new Promise((resolve) => setTimeout(resolve, 20000));
    logSuccess(`Holder ${holderAccountId} added to control list\n`);

    // Step 3: Mint tokens to the holder
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 3: MINT TOKENS TO HOLDER");
    logHeader("═══════════════════════════════════");

    const mintTx = await mintBond(format, bondContractId, holderAccountId, partition, mintAmount);
    const signedMintTx = await signTransaction(mintTx.unsignedTx);
    logSuccess("Mint transaction signed!");

    await publishSignedTransaction(signedMintTx, {
      description: "Mint Bonds for Hold Testing",
      bondContractId: bondContractId,
      holderAccountId: holderAccountId,
      amount: mintAmount,
    });

    logInfo("⏳ Waiting 10 seconds for mint transaction to be processed...");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    logSuccess(`Minted ${mintAmount} tokens to ${holderAccountId}\n`);

    // Step 4: Create hold
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 4: CREATE BOND HOLD");
    logHeader("═══════════════════════════════════");

    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Partition: ${partition}`);
    logInfo(`Amount to Hold: ${amount}`);
    logInfo(`Expiration: ${expirationTimestamp.toISOString()} (${expirationMinutes} minutes from now)`);
    logInfo(`Escrow Account ID: ${escrowAccountId}`);
    logInfo(`Data: ${data}`);
    log("");

    // Create bond hold
    const createHoldTx = await createBondHold(
      format,
      bondContractId,
      holderAccountId,
      partition,
      amount,
      expirationTimestamp,
      escrowAccountId,
      data,
    );

    logHeader("🔐 Signing transaction...");
    const signedTx = await signTransaction(createHoldTx.unsignedTx);
    logSuccess("Transaction signed successfully!");
    logInfo(`Signed Tx: ${signedTx.substring(0, 50)}...`);

    await publishSignedTransaction(signedTx, {
      description: "Create Bond Hold",
      bondContractId: bondContractId,
      holderAccountId: holderAccountId,
      amount: amount,
    });

    logHeader("═══════════════════════════════════");
    logHeader("  ✨ HOLD CREATION COMPLETED!");
    logHeader("═══════════════════════════════════");
    log("Successfully created bond, added holder to control list, minted tokens, and created hold.", colors.green);
    log(`Bond Contract ID: ${bondContractId}`, colors.green);
    log(`Holder Account ID: ${holderAccountId}`, colors.green);
    log(`Minted Amount: ${mintAmount}`, colors.green);
    log(`Hold Amount: ${amount}`, colors.green);
    log(`Expiration: ${expirationTimestamp.toISOString()}\n`, colors.green);

    logInfo("💡 Tip: Use get-bond-holds.js to see the created hold");
    logInfo(
      `   BOND_CONTRACT_ID=${bondContractId} HOLDER_ACCOUNT_ID=${holderAccountId} npm run scripts:ats:get-bond-holds`,
    );
    logInfo("💡 Tip: Use execute-hold.js to execute the hold");
    logInfo(
      `   BOND_CONTRACT_ID=${bondContractId} HOLDER_ACCOUNT_ID=${holderAccountId} HOLD_ID=1 TO_ACCOUNT_ID=<recipient> npm run ats:execute-hold`,
    );
    logInfo("💡 Tip: Use release-hold.js to release the hold before expiration");
    logInfo(
      `   BOND_CONTRACT_ID=${bondContractId} HOLDER_ACCOUNT_ID=${holderAccountId} HOLD_ID=1 npm run ats:release-hold`,
    );
  } catch (error) {
    logError(`Script execution failed: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createBondHold,
  createBondWithWhitelist,
};
