#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const MIRROR_APIS = {
  testnet: "https://testnet.mirrornode.hedera.com/api/v1/blocks?limit=1&order=desc",
  mainnet: "https://mainnet.mirrornode.hedera.com/api/v1/blocks?limit=1&order=desc",
};

const ENV_FILES = ["../../apps/ats/api/.env", "../../apps/primary-market/api/.env", "../../apps/treasury/api/.env"];

function getNetwork() {
  const arg = process.argv[2]?.toLowerCase();
  if (arg && !MIRROR_APIS[arg]) {
    console.error(`Invalid network: ${arg}. Use 'testnet' or 'mainnet'.`);
    process.exit(1);
  }
  return arg || "testnet";
}

async function getLatestBlockNumber(network) {
  const response = await fetch(MIRROR_APIS[network]);
  if (!response.ok) {
    throw new Error(`Failed to fetch from Hedera API: ${response.statusText}`);
  }
  const data = await response.json();
  const blockNumber = data.blocks?.[0]?.number;
  if (!blockNumber) {
    throw new Error("Could not extract block number from API response");
  }
  return blockNumber;
}

function updateEnvFile(filePath, blockNumber) {
  const absolutePath = path.resolve(__dirname, filePath);

  if (!fs.existsSync(absolutePath)) {
    console.log(`File not found: ${absolutePath}`);
    return false;
  }

  let content = fs.readFileSync(absolutePath, "utf8");
  const varName = "BLOCKCHAIN_LISTENER_BLOCK_NUMBER";
  const regex = new RegExp(`^${varName}=.*$`, "m");

  if (regex.test(content)) {
    content = content.replace(regex, `${varName}=${blockNumber}`);
  } else {
    content += `\n${varName}=${blockNumber}`;
  }

  fs.writeFileSync(absolutePath, content);
  console.log(`Updated: ${absolutePath}`);
  return true;
}

async function main() {
  try {
    const network = getNetwork();
    console.log(`Fetching latest block from Hedera ${network}...`);
    const blockNumber = await getLatestBlockNumber(network);
    console.log(`Latest block number: ${blockNumber}\n`);

    let updated = 0;
    for (const envFile of ENV_FILES) {
      if (updateEnvFile(envFile, blockNumber)) {
        updated++;
      }
    }

    console.log(`\nDone! Updated ${updated} .env files with block number: ${blockNumber}`);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
