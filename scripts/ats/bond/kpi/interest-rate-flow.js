const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logInfo, logHeader, colors } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { createBond } = require("../bond-service");
const { getLatestBond } = require("../document/set-bond-document");
const { setInterestRateTx, getInterestRate } = require("./kpi-service");

const INTEREST_RATE_V1 = {
  maxRate: "600",
  baseRate: "400",
  minRate: "200",
  startPeriod: "0",
  startRate: "400",
  missedPenalty: "50",
  reportPeriod: "31536000",
  rateDecimals: 2,
};

const INTEREST_RATE_V2 = {
  maxRate: "800",
  baseRate: "500",
  minRate: "300",
  startPeriod: "0",
  startRate: "500",
  missedPenalty: "100",
  reportPeriod: "31536000",
  rateDecimals: 2,
};

async function runInterestRateFlow() {
  logHeader("📈 KPI Interest Rate Flow");

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

  logHeader("⚙️  Step 3: Setting Interest Rate (first config)");
  const tx1 = await setInterestRateTx(bondContractId, INTEREST_RATE_V1, format);
  const signed1 = await signTransaction(tx1.unsignedTx);
  await publishSignedTransaction(signed1);
  logSuccess("Transaction published");

  log("\n⏳ Waiting for blockchain listener (15 seconds)...", colors.yellow);
  await new Promise((r) => setTimeout(r, 15000));

  logHeader("✅ Step 4: Verifying Interest Rate Persisted (GET)");
  const saved = await getInterestRate(bondContractId);
  if (saved.baseRate !== INTEREST_RATE_V1.baseRate.toString()) {
    logError(`Expected baseRate=${INTEREST_RATE_V1.baseRate}, got ${saved.baseRate}`);
    process.exit(1);
  }
  logSuccess("✅ Interest rate persisted correctly");

  logHeader("🔄 Step 5: Updating Interest Rate (upsert verification)");
  const tx2 = await setInterestRateTx(bondContractId, INTEREST_RATE_V2, format);
  const signed2 = await signTransaction(tx2.unsignedTx);
  await publishSignedTransaction(signed2);
  logSuccess("Update transaction published");

  log("\n⏳ Waiting for blockchain listener (15 seconds)...", colors.yellow);
  await new Promise((r) => setTimeout(r, 15000));

  logHeader("✅ Step 6: Verifying Upsert (GET — should reflect updated values)");
  const updated = await getInterestRate(bondContractId);
  if (updated.baseRate !== INTEREST_RATE_V2.baseRate.toString()) {
    logError(`Expected baseRate=${INTEREST_RATE_V2.baseRate}, got ${updated.baseRate}`);
    process.exit(1);
  }
  if (updated.id !== saved.id) {
    logError(`Upsert failed — different record ids: ${saved.id} vs ${updated.id}`);
    process.exit(1);
  }
  logSuccess("✅ Upsert confirmed — same record updated, baseRate reflects new value");

  logHeader("🎉 Interest Rate Flow Complete!");
  logInfo(`Bond: ${bondContractId}`);
  logInfo(`Record ID: ${updated.id}`);
  logInfo(`baseRate: ${updated.baseRate} (updated from ${INTEREST_RATE_V1.baseRate})`);
}

async function main() {
  try {
    logHeader("🏦 KPI Interest Rate Flow");
    log("=".repeat(60), colors.bright);
    log(`📡 Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log("=".repeat(60) + "\n", colors.bright);
    await runInterestRateFlow();
  } catch (error) {
    logError(`Flow failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("  • Gateway API running?");
    logError("  • Blockchain listener running?");
    logError("  • ACCOUNT_ID has INTEREST_RATE_MANAGER_ROLE (set by default on bond creation)");
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { runInterestRateFlow };
