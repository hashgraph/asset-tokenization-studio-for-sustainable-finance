const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logInfo, logHeader, colors } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { createBond } = require("../bond-service");
const { getLatestBond } = require("../document/set-bond-document");
const { setImpactDataTx, getImpactData } = require("./kpi-service");

const IMPACT_DATA_V1 = {
  maxDeviationCap: "120",
  baseLine: "100",
  maxDeviationFloor: "80",
  impactDataDecimals: 2,
  adjustmentPrecision: "10000",
};

const IMPACT_DATA_V2 = {
  maxDeviationCap: "150",
  baseLine: "120",
  maxDeviationFloor: "90",
  impactDataDecimals: 2,
  adjustmentPrecision: "10000",
};

async function runImpactDataFlow() {
  logHeader("📊 KPI Impact Data Flow");

  if (!validateSigningConfig()) return;

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

  logHeader("🏗️  Step 1: Creating Bond");
  const bond = await createBond(format);
  const signedBondTx = await signTransaction(bond.unsignedTx);
  await publishSignedTransaction(signedBondTx);
  logSuccess("Bond transaction published");

  log("\n⏳ Waiting for bond creation (15 seconds)...", colors.yellow);
  await new Promise((r) => setTimeout(r, 15000));

  logHeader("🔍 Step 2: Fetching Created Bond");
  const createdBond = await getLatestBond();
  if (!createdBond?.contractId) {
    logError("Could not retrieve created bond");
    process.exit(1);
  }
  const bondContractId = createdBond.contractId;
  logSuccess(`Bond: ${bondContractId} (${createdBond.symbol})`);

  log("\n⏳ Waiting for event filters to register (10 seconds)...", colors.yellow);
  await new Promise((r) => setTimeout(r, 10000));

  logHeader("📊 Step 3: Setting Impact Data (first config)");
  const tx1 = await setImpactDataTx(bondContractId, IMPACT_DATA_V1, format);
  const signed1 = await signTransaction(tx1.unsignedTx);
  await publishSignedTransaction(signed1);
  logSuccess("Transaction published");

  log("\n⏳ Waiting for blockchain listener (15 seconds)...", colors.yellow);
  await new Promise((r) => setTimeout(r, 15000));

  logHeader("✅ Step 4: Verifying Impact Data Persisted (GET)");
  const saved = await getImpactData(bondContractId);
  if (saved.baseLine !== IMPACT_DATA_V1.baseLine.toString()) {
    logError(`Expected baseLine=${IMPACT_DATA_V1.baseLine}, got ${saved.baseLine}`);
    process.exit(1);
  }
  logSuccess("✅ Impact data persisted correctly");

  logHeader("🔄 Step 5: Updating Impact Data (upsert verification)");
  const tx2 = await setImpactDataTx(bondContractId, IMPACT_DATA_V2, format);
  const signed2 = await signTransaction(tx2.unsignedTx);
  await publishSignedTransaction(signed2);
  logSuccess("Update transaction published");

  log("\n⏳ Waiting for blockchain listener (15 seconds)...", colors.yellow);
  await new Promise((r) => setTimeout(r, 15000));

  logHeader("✅ Step 6: Verifying Upsert (GET — should reflect updated values)");
  const updated = await getImpactData(bondContractId);
  if (updated.baseLine !== IMPACT_DATA_V2.baseLine.toString()) {
    logError(`Expected baseLine=${IMPACT_DATA_V2.baseLine}, got ${updated.baseLine}`);
    process.exit(1);
  }
  if (updated.id !== saved.id) {
    logError(`Upsert failed — different record ids: ${saved.id} vs ${updated.id}`);
    process.exit(1);
  }
  logSuccess("✅ Upsert confirmed — same record updated, baseLine reflects new value");

  logHeader("🎉 Impact Data Flow Complete!");
  logInfo(`Bond: ${bondContractId}`);
  logInfo(`Record ID: ${updated.id}`);
  logInfo(`baseLine: ${updated.baseLine} (updated from ${IMPACT_DATA_V1.baseLine})`);
}

async function main() {
  try {
    logHeader("🏦 KPI Impact Data Flow");
    log("=".repeat(60), colors.bright);
    log(`📡 Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log("=".repeat(60) + "\n", colors.bright);
    await runImpactDataFlow();
  } catch (error) {
    logError(`Flow failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("  • Gateway API running?");
    logError("  • Blockchain listener running?");
    logError("  • ACCOUNT_ID has KPI_MANAGER_ROLE (set by default on bond creation)");
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { runImpactDataFlow };
