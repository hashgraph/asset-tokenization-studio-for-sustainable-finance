const {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  TokenMintTransaction,
  AccountAllowanceApproveTransaction,
} = require("@hiero-ledger/sdk");
const { logSuccess, logError, logInfo, logHeader } = require("../../shared/lib/logger");
const { config } = require("../../shared/lib/config");

/**
 * Deploy an HTS token for testing
 * @param {string} tokenName - The token name
 * @param {string} tokenSymbol - The token symbol
 * @param {number} tokenDecimals - Number of decimals
 * @param {number} initialSupply - Initial supply to mint
 * @returns {Promise<{tokenId: string, evmAddress: string}>} Token details
 */
async function deployHTSToken(
  tokenName = "Auto Test Token",
  tokenSymbol = "ATT",
  tokenDecimals = 6,
  initialSupply = 1_000_000_000,
) {
  logHeader(`🪙 Deploying HTS Token: ${tokenName} (${tokenSymbol})`);

  let client;

  try {
    // Setup Hedera client
    client = Client.forTestnet();

    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
    const privateKeyStr = format === "hedera" ? config.HEDERA_PRIVATE_KEY : config.ETHEREUM_PRIVATE_KEY;
    const accountId = config.ACCOUNT_ID;

    if (!privateKeyStr || !accountId) {
      throw new Error("HEDERA_PRIVATE_KEY/ETHEREUM_PRIVATE_KEY and ACCOUNT_ID must be set");
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
    logInfo(`  • Name: ${tokenName}`);
    logInfo(`  • Symbol: ${tokenSymbol}`);
    logInfo(`  • Decimals: ${tokenDecimals}`);
    logInfo(`  • Initial Supply: ${initialSupply / Math.pow(10, tokenDecimals)} ${tokenSymbol}`);

    // Create the token (no KYC, no Freeze for easier testing)
    logInfo("Creating HTS token...");
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName(tokenName)
      .setTokenSymbol(tokenSymbol)
      .setDecimals(tokenDecimals)
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Infinite)
      .setInitialSupply(0)
      .setTreasuryAccountId(operatorAccountId)
      .setAdminKey(operatorKey.publicKey)
      .setWipeKey(operatorKey.publicKey)
      .setSupplyKey(operatorKey.publicKey)
      .setPauseKey(operatorKey.publicKey)
      .setFeeScheduleKey(operatorKey.publicKey)
      .setMaxTransactionFee(new Hbar(50))
      .freezeWith(client);

    const tokenCreateSign = await tokenCreateTx.sign(operatorKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);

    if (!tokenCreateRx.tokenId) {
      throw new Error("Token creation failed - no token ID in receipt");
    }

    const tokenId = tokenCreateRx.tokenId;
    logSuccess(`✅ Token created: ${tokenId.toString()}`);

    // Mint initial supply
    logInfo("Minting initial supply...");
    const mintTx = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setAmount(initialSupply)
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client);

    const mintSign = await mintTx.sign(operatorKey);
    const mintSubmit = await mintSign.execute(client);
    await mintSubmit.getReceipt(client);

    const tokenEvmAddress = "0x" + tokenId.num.toString(16).padStart(40, "0");
    logSuccess(`✅ Minted ${initialSupply / Math.pow(10, tokenDecimals)} ${tokenSymbol}`);
    logInfo(`Token ID: ${tokenId.toString()}`);
    logInfo(`Token EVM Address: ${tokenEvmAddress}`);

    return {
      tokenId: tokenId.toString(),
      evmAddress: tokenEvmAddress,
    };
  } catch (error) {
    logError(`Failed to deploy HTS token: ${error.message}`);
    throw error;
  } finally {
    if (client) {
      client.close();
    }
  }
}

/**
 * Approve token allowance for a spender
 * @param {string} tokenId - The HTS token ID (e.g., "0.0.1234567")
 * @param {string} spenderAccountId - The spender account ID (e.g., Primary Market contract)
 * @returns {Promise<void>}
 */
async function approveTokenAllowance(tokenId, spenderAccountId) {
  logHeader(`✅ Approving Token Allowance`);

  let client;

  try {
    client = Client.forTestnet();

    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
    const privateKeyStr = format === "hedera" ? config.HEDERA_PRIVATE_KEY : config.ETHEREUM_PRIVATE_KEY;
    const accountId = config.ACCOUNT_ID;

    if (!privateKeyStr || !accountId) {
      throw new Error("HEDERA_PRIVATE_KEY/ETHEREUM_PRIVATE_KEY and ACCOUNT_ID must be set");
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

    const token = require("@hiero-ledger/sdk").TokenId.fromString(tokenId);
    const spender = AccountId.fromString(spenderAccountId);
    const approveAmount = Number.MAX_SAFE_INTEGER; // Use max safe integer instead of int64 max

    logInfo(`Owner: ${operatorAccountId.toString()}`);
    logInfo(`Spender: ${spenderAccountId}`);
    logInfo(`Token: ${tokenId}`);
    logInfo(`Amount: ${approveAmount} (max allowance)`);

    logInfo("Submitting allowance approval transaction...");
    const approveTx = new AccountAllowanceApproveTransaction()
      .approveTokenAllowance(token, operatorAccountId, spender, approveAmount)
      .setMaxTransactionFee(new Hbar(10))
      .freezeWith(client);

    const approveSign = await approveTx.sign(operatorKey);
    const approveSubmit = await approveSign.execute(client);
    await approveSubmit.getReceipt(client);

    logSuccess(`✅ Token allowance approved!`);
    logInfo(`The Primary Market can now spend your tokens`);
  } catch (error) {
    logError(`Failed to approve token allowance: ${error.message}`);
    throw error;
  } finally {
    if (client) {
      client.close();
    }
  }
}

module.exports = {
  deployHTSToken,
  approveTokenAllowance,
};
