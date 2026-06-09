const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logInfo, logHeader, colors } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { createBond } = require("../bond-service");
const { getLatestBond } = require("../document/set-bond-document");
const { addKpiDataTx, getKpiData, getKpiDataItem } = require("./kpi-service");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");

async function runKpiDataFlow() {
  logHeader("📈 KPI Data Points Flow");

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

  // Two data points with different past timestamps
  const now = Math.floor(Date.now() / 1000);
  const date1 = String(now - 120);
  const date2 = String(now - 60);
  // project must be an EVM address — convert from Hedera format
  const projectAddress = await ConverterUtils.getEvmAddressFromHederaAddress(bondContractId);
  logInfo(`Project EVM address: ${projectAddress}`);

  logHeader("📈 Step 3: Adding First KPI Data Point");
  logInfo(`date=${date1}, value=105`);
  const tx1 = await addKpiDataTx(bondContractId, date1, "105", projectAddress, format);
  const signed1 = await signTransaction(tx1.unsignedTx);
  await publishSignedTransaction(signed1);
  logSuccess("First data point published");

  logHeader("📈 Step 4: Adding Second KPI Data Point");
  logInfo(`date=${date2}, value=110`);
  const tx2 = await addKpiDataTx(bondContractId, date2, "110", projectAddress, format);
  const signed2 = await signTransaction(tx2.unsignedTx);
  await publishSignedTransaction(signed2);
  logSuccess("Second data point published");

  log("\n⏳ Waiting for blockchain listener (15 seconds)...", colors.yellow);
  await new Promise((r) => setTimeout(r, 15000));

  logHeader("✅ Step 5: Verifying KPI Data List (GET paginated)");
  const page = await getKpiData(bondContractId, { limit: 10 });
  if (page.total < 2) {
    logError(`Expected at least 2 data points, found ${page.total}`);
    process.exit(1);
  }
  logSuccess(`✅ Found ${page.total} data point(s) in database`);

  logHeader("✅ Step 6: Verifying Pagination");
  const page1 = await getKpiData(bondContractId, { limit: 1, page: 1 });
  if (page1.items.length !== 1 || page1.totalPages < 2) {
    logError("Pagination not working correctly");
    process.exit(1);
  }
  logSuccess(`✅ Pagination correct — totalPages=${page1.totalPages}`);

  logHeader("✅ Step 7: Verifying Single Item (GET by ID)");
  const firstId = page.items[0].id;
  const item = await getKpiDataItem(bondContractId, firstId);
  if (item.id !== firstId) {
    logError(`Expected id=${firstId}, got ${item.id}`);
    process.exit(1);
  }
  logSuccess("✅ Single item retrieved correctly");

  logHeader("🎉 KPI Data Flow Complete!");
  logInfo(`Bond: ${bondContractId}`);
  logInfo(`Total data points: ${page.total}`);
  logInfo(`Latest item — date: ${item.date}, value: ${item.value}`);
}

async function main() {
  try {
    logHeader("🏦 KPI Data Points Flow");
    log("=".repeat(60), colors.bright);
    log(`📡 Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log("=".repeat(60) + "\n", colors.bright);
    await runKpiDataFlow();
  } catch (error) {
    logError(`Flow failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("  • Gateway API running?");
    logError("  • Blockchain listener running?");
    logError("  • ACCOUNT_ID has KPI_MANAGER_ROLE (set by default on bond creation)");
    logError("  • date must be <= block.timestamp");
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { runKpiDataFlow };
