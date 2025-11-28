const { config } = require("../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { gatewayClient } = require("../../shared/lib/gateway-client");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");

const ROLES = {
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  DOCUMENTER_ROLE: "0x83ace103a76d3729b4ba1350ad27522bbcda9a1a589d1e5091f443e76abccf41",
  CONTROL_LIST_ROLE: "0xca537e1c88c9f52dc5692c96c482841c3bea25aafc5f3bfe96f645b5f800cac3",
  CORPORATE_ACTION_ROLE: "0x8a139eeb747b9809192ae3de1b88acfd2568c15241a5c4f85db0443a536d77d6",
  LOCKER_ROLE: "0xd8aa8c6f92fe8ac3f3c0f88216e25f7c08b3a6c374b4452a04d200c29786ce88",
  ISSUER_ROLE: "0x4be32e8849414d19186807008dabd451c1d87dae5f8e22f32f5ce94d486da842",
  PAUSER_ROLE: "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb",
};

async function grantRole(contractId, userAccountId, roleId, format) {
  log(`\n🔐 Granting role to ${userAccountId}...`, colors.bright);

  const userEvmAddress = await ConverterUtils.getEvmAddressFromHederaAddress(userAccountId);
  logInfo(`Using EVM address: ${userEvmAddress}`);

  const grantRoleRequest = {
    roleId: roleId,
    userAccountId: userEvmAddress,
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.post(
      `/api/v1/ats/bonds/${contractId}/roles/${roleId}/users/${userEvmAddress}`,
      grantRoleRequest,
    );

    logSuccess("Role grant transaction created successfully!");
    logInfo(`Contract ID: ${contractId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    logInfo(`Role ID: ${roleId}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 100)}...`);

    return { ...grantRoleRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to grant role: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function grantAllRoles(contractId, userAccountId, format) {
  logHeader("🔐 Granting All Required Roles");

  const rolesToGrant = process.env.ROLES
    ? process.env.ROLES.split(",").map((r) => r.trim())
    : ["ISSUER_ROLE", "LOCKER_ROLE", "CORPORATE_ACTION_ROLE", "DOCUMENTER_ROLE", "CONTROL_LIST_ROLE"];

  for (const roleName of rolesToGrant) {
    if (!ROLES[roleName]) {
      logError(`Unknown role: ${roleName}`);
      continue;
    }

    try {
      logHeader(`📝 Granting ${roleName}...`);
      const grantTx = await grantRole(contractId, userAccountId, ROLES[roleName], format);

      logHeader(`✍️  Signing transaction...`);
      const signedTx = await signTransaction(grantTx.unsignedTx);
      logSuccess("Transaction signed successfully!");

      logHeader(`📤 Publishing transaction...`);
      await publishSignedTransaction(signedTx);
      logSuccess("Transaction published to message queue");

      log("\n⏳ Waiting for transaction to be processed (5 seconds)...", colors.yellow);
      await new Promise((resolve) => setTimeout(resolve, 5000));

      logSuccess(`✅ ${roleName} granted successfully!\n`);
    } catch (error) {
      logError(`Failed to grant ${roleName}: ${error.message}`);
      // Continue with other roles even if one fails
    }
  }
}

async function main() {
  try {
    logHeader("🔐 Evercity Grant Role");
    log("==========================================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`🔧 Gateway URL: ${process.env.GATEWAY_URL || "http://localhost:3000"}`, colors.blue);

    if (!validateSigningConfig()) {
      return;
    }

    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
    const contractId = process.env.BOND_CONTRACT_ID || process.env.CONTRACT_ID;
    const userAccountId = process.env.USER_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const roleId = process.env.ROLE_ID;

    if (!contractId) {
      logError("BOND_CONTRACT_ID or CONTRACT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    if (!userAccountId) {
      logError("USER_ACCOUNT_ID or ACCOUNT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    log(`\n🎯 Grant Configuration:`, colors.cyan);
    logInfo(`  • Contract ID: ${contractId}`);
    logInfo(`  • User Account ID: ${userAccountId}`);
    logInfo(`  • Format: ${format.toUpperCase()}\n`);

    if (roleId) {
      // Grant single role
      logHeader(`📝 Granting Single Role...`);
      const grantTx = await grantRole(contractId, userAccountId, roleId, format);

      logHeader(`✍️  Signing Transaction...`);
      const signedTx = await signTransaction(grantTx.unsignedTx);
      logSuccess("Transaction signed successfully!");

      logHeader(`📤 Publishing Transaction...`);
      await publishSignedTransaction(signedTx);
      logSuccess("Transaction published to message queue");

      log("\n⏳ Waiting for transaction to be processed (10 seconds)...", colors.yellow);
      await new Promise((resolve) => setTimeout(resolve, 10000));

      logHeader("🎉 Grant Role Operation Completed!");
      logSuccess(`Role granted to: ${userAccountId}`);
    } else {
      // Grant multiple roles
      await grantAllRoles(contractId, userAccountId, format);

      logHeader("🎉 Grant All Roles Operation Completed!");
      logSuccess(`All roles granted to: ${userAccountId}`);
      logInfo("\n📋 To verify roles were granted, run:");
      logInfo(`   BOND_CONTRACT_ID=${contractId} npm run ats:check-roles\n`);
    }
  } catch (error) {
    logError(`\nScript failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("   • Ensure Gateway API is running (check .env GATEWAY_URL)");
    logError("   • Verify CONTRACT_ID exists");
    logError("   • Verify you have DEFAULT_ADMIN_ROLE to grant other roles");
    logError("   • Check private key configuration in .env");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { grantRole, ROLES };
