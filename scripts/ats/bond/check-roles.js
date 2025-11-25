const { config } = require("../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../shared/lib/logger");
const { ContractCallQuery, ContractId } = require("@hashgraph/sdk");
const { Interface } = require("ethers/lib/utils");
const { IAccessControl__factory } = require("@hashgraph/green-bonds-platform-treasury-contracts");
const { getHederaClient } = require("@hashgraph/green-bonds-shared-core");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");

const ROLES = {
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  DOCUMENTER_ROLE: "0x83ace103a76d3729b4ba1350ad27522bbcda9a1a589d1e5091f443e76abccf41",
  CONTROL_LIST_ROLE: "0xca537e1c88c9f52dc5692c96c482841c3bea25aafc5f3bfe96f645b5f800cac3",
  CORPORATE_ACTION_ROLE: "0x8a139eeb747b9809192ae3de1b88acfd2568c15241a5c4f85db0443a536d77d6",
  LOCKER_ROLE: "0xd8aa8c6f92fe8ac3f3c0f88216e25f7c08b3a6c374b4452a04d200c29786ce88",
  ISSUER_ROLE: "0x4be32e8849414d19186807008dabd451c1d87dae5f8e22f32f5ce94d486da842",
};

async function checkRole(bondContractId, accountAddress, roleName, roleBytes) {
  try {
    const { AccountId, PrivateKey } = require("@hashgraph/sdk");
    const client = getHederaClient(config.HEDERA_NETWORK || "testnet");

    // Set operator for the client
    const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
    const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
    client.setOperator(operatorId, operatorKey);

    const contractInterface = IAccessControl__factory.createInterface();

    const encodedCall = contractInterface.encodeFunctionData("hasRole", [roleBytes, accountAddress]);
    const encodedCallBytes = Buffer.from(encodedCall.slice(2), "hex");

    const query = new ContractCallQuery()
      .setContractId(ContractId.fromString(bondContractId))
      .setGas(100000)
      .setFunctionParameters(encodedCallBytes);

    const result = await query.execute(client);
    const resultHex = "0x" + Buffer.from(result.bytes).toString("hex");
    const decoded = contractInterface.decodeFunctionResult("hasRole", resultHex);

    const hasRole = decoded[0];

    if (hasRole) {
      logSuccess(`✓ ${roleName}: YES`);
    } else {
      logError(`✗ ${roleName}: NO`);
    }

    return hasRole;
  } catch (error) {
    logError(`Error checking ${roleName}: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    logHeader("🔐 Check Bond Roles");
    log("==========================================\n", colors.bright);

    const bondContractId = process.env.BOND_CONTRACT_ID;
    const accountId = process.env.ACCOUNT_ID;

    if (!bondContractId) {
      logError("BOND_CONTRACT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    if (!accountId) {
      logError("ACCOUNT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    const accountAddress = await ConverterUtils.getEvmAddressFromHederaAddress(accountId);

    log(`📋 Bond Contract: ${bondContractId}`, colors.cyan);
    log(`👤 Account: ${accountId} (${accountAddress})`, colors.cyan);
    log("\n🔍 Checking roles...\n", colors.bright);

    for (const [roleName, roleBytes] of Object.entries(ROLES)) {
      await checkRole(bondContractId, accountAddress, roleName, roleBytes);
    }

    log("\n✅ Role check completed!", colors.green);
  } catch (error) {
    logError(`\nScript failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkRole };
