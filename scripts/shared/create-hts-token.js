#!/usr/bin/env node

/**
 * Script to create a Hedera Token Service (HTS) fungible token
 *
 * Usage:
 *   npm run shared:create-hts-token -- --name "My Token" --symbol "MTK" --decimals 6 --supply 1000000
 *
 * Options:
 *   --name         Token name (default: "Test Token")
 *   --symbol       Token symbol (default: "TEST")
 *   --decimals     Number of decimals (default: 6)
 *   --supply       Initial supply to mint (default: 1000000000)
 *   --infinite     Use infinite supply type (default: true)
 *   --memo         Token memo (optional)
 *   --no-keys      Don't set admin/supply/wipe keys (default: false, keys are set)
 */

const {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  TokenMintTransaction,
} = require("@hashgraph/sdk");
const { logSuccess, logError, logInfo, logHeader, logWarning } = require("./lib/logger");
const { config } = require("./lib/config");

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    name: "Test Token",
    symbol: "TEST",
    decimals: 6,
    supply: 1_000_000_000,
    infinite: true,
    memo: "",
    setKeys: true,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--name":
        options.name = args[++i];
        break;
      case "--symbol":
        options.symbol = args[++i];
        break;
      case "--decimals":
        options.decimals = parseInt(args[++i]);
        break;
      case "--supply":
        options.supply = parseInt(args[++i]);
        break;
      case "--infinite":
        options.infinite = args[++i]?.toLowerCase() !== "false";
        break;
      case "--memo":
        options.memo = args[++i];
        break;
      case "--no-keys":
        options.setKeys = false;
        break;
      case "--help":
      case "-h":
        console.log(`
Usage: npm run shared:create-hts-token -- [options]

Options:
  --name <string>       Token name (default: "Test Token")
  --symbol <string>     Token symbol (default: "TEST")
  --decimals <number>   Number of decimals (default: 6)
  --supply <number>     Initial supply to mint (default: 1000000000)
  --infinite            Use infinite supply type (default: true)
  --memo <string>       Token memo (optional)
  --no-keys             Don't set admin/supply/wipe keys
  --help, -h            Show this help message

Examples:
  npm run shared:create-hts-token
  npm run shared:create-hts-token -- --name "Payment Token" --symbol "PAY" --decimals 2
  npm run shared:create-hts-token -- --name "Green Token" --symbol "GREEN" --supply 10000000000
        `);
        process.exit(0);
    }
  }

  return options;
}

/**
 * Create an HTS token
 */
async function createHTSToken() {
  const options = parseArgs();

  logHeader(`🪙 Creating Hedera Token Service (HTS) Token`);

  let client;

  try {
    // Setup Hedera client
    client = Client.forTestnet();

    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
    const privateKeyStr = format === "hedera" ? config.HEDERA_PRIVATE_KEY : config.ETHEREUM_PRIVATE_KEY;
    const accountId = config.ACCOUNT_ID;

    if (!privateKeyStr || !accountId) {
      throw new Error("HEDERA_PRIVATE_KEY/ETHEREUM_PRIVATE_KEY and ACCOUNT_ID must be set in .env");
    }

    // Parse operator key based on format
    let operatorKey;
    if (format === "ethereum") {
      // For Ethereum format, remove 0x prefix if present and use ECDSA
      const cleanKey = privateKeyStr.startsWith("0x") ? privateKeyStr.slice(2) : privateKeyStr;
      operatorKey = PrivateKey.fromStringECDSA(cleanKey);
    } else {
      // For Hedera format, try ED25519 first, then DER
      try {
        operatorKey = PrivateKey.fromStringED25519(privateKeyStr);
      } catch {
        operatorKey = PrivateKey.fromStringDer(privateKeyStr);
      }
    }

    const operatorAccountId = AccountId.fromString(accountId);
    client.setOperator(operatorAccountId, operatorKey);

    logInfo(`Operator Account: ${operatorAccountId.toString()}`);
    logInfo(`Token Configuration:`);
    logInfo(`  • Name: ${options.name}`);
    logInfo(`  • Symbol: ${options.symbol}`);
    logInfo(`  • Decimals: ${options.decimals}`);
    logInfo(`  • Supply Type: ${options.infinite ? "Infinite" : "Finite"}`);
    logInfo(`  • Initial Supply: ${options.supply / Math.pow(10, options.decimals)} ${options.symbol}`);
    if (options.memo) {
      logInfo(`  • Memo: ${options.memo}`);
    }
    if (!options.setKeys) {
      logWarning(`  • Keys: None (token will be immutable)`);
    }

    // Create the token
    logInfo("Creating HTS token transaction...");
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName(options.name)
      .setTokenSymbol(options.symbol)
      .setDecimals(options.decimals)
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(options.infinite ? TokenSupplyType.Infinite : TokenSupplyType.Finite)
      .setInitialSupply(0) // We'll mint after creation
      .setTreasuryAccountId(operatorAccountId)
      .setMaxTransactionFee(new Hbar(50));

    if (options.memo) {
      tokenCreateTx.setTokenMemo(options.memo);
    }

    // Set keys if requested (makes token manageable)
    if (options.setKeys) {
      tokenCreateTx
        .setAdminKey(operatorKey.publicKey)
        .setWipeKey(operatorKey.publicKey)
        .setSupplyKey(operatorKey.publicKey)
        .setPauseKey(operatorKey.publicKey)
        .setFeeScheduleKey(operatorKey.publicKey);
      logInfo("Setting admin, supply, wipe, pause, and fee schedule keys...");
    }

    // Freeze and sign
    const tokenCreateFreeze = await tokenCreateTx.freezeWith(client);
    const tokenCreateSign = await tokenCreateFreeze.sign(operatorKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);

    if (!tokenCreateRx.tokenId) {
      throw new Error("Token creation failed - no token ID in receipt");
    }

    const tokenId = tokenCreateRx.tokenId;
    logSuccess(`✅ Token created: ${tokenId.toString()}`);

    // Mint initial supply if requested
    if (options.supply > 0) {
      if (!options.setKeys) {
        logWarning("Cannot mint initial supply - no supply key set");
      } else {
        logInfo(`Minting initial supply of ${options.supply / Math.pow(10, options.decimals)} ${options.symbol}...`);
        const mintTx = new TokenMintTransaction()
          .setTokenId(tokenId)
          .setAmount(options.supply)
          .setMaxTransactionFee(new Hbar(20))
          .freezeWith(client);

        const mintSign = await mintTx.sign(operatorKey);
        const mintSubmit = await mintSign.execute(client);
        await mintSubmit.getReceipt(client);

        logSuccess(`✅ Minted ${options.supply / Math.pow(10, options.decimals)} ${options.symbol}`);
      }
    }

    // Calculate EVM address
    const tokenEvmAddress = "0x" + tokenId.toSolidityAddress();

    logHeader("📋 Token Details");
    logSuccess(`Token ID: ${tokenId.toString()}`);
    logSuccess(`Token EVM Address: ${tokenEvmAddress}`);
    logSuccess(`Treasury Account: ${operatorAccountId.toString()}`);
    logSuccess(`Total Supply: ${options.supply / Math.pow(10, options.decimals)} ${options.symbol}`);

    // Output in a format easy to copy for .env or scripts
    console.log("\n📝 For your .env file or scripts:");
    console.log(`TOKEN_ID=${tokenId.toString()}`);
    console.log(`TOKEN_EVM_ADDRESS=${tokenEvmAddress}`);

    return {
      tokenId: tokenId.toString(),
      evmAddress: tokenEvmAddress,
      supply: options.supply,
    };
  } catch (error) {
    logError(`Failed to create HTS token: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    if (client) {
      client.close();
    }
  }
}

// Run the script
if (require.main === module) {
  createHTSToken()
    .then(() => {
      logSuccess("\n🎉 HTS token creation completed!");
      process.exit(0);
    })
    .catch((error) => {
      logError(`Script failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { createHTSToken };
