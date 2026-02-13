import fs from "fs";
import path from "path";

const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com/api/v1/blocks?limit=1&order=desc";

const ENV_KEY = "BLOCKCHAIN_LISTENER_BLOCK_NUMBER";

// carpetas a ignorar (añade las que quieras)
const IGNORED_DIRS = new Set(["node_modules", ".git", "target", "dist", "build", ".idea", ".vscode"]);

const IGNORED_ENVS = [".example", ".sample"];

async function getLatestBlock() {
  const res = await fetch(MIRROR_NODE_URL);
  const data = await res.json();

  if (!data.blocks?.length) {
    throw new Error("No blocks returned from mirror node");
  }

  return data.blocks[0];
}

function isEnvFile(fileName) {
  return fileName === ".env" || fileName.startsWith(".env.");
}

function updateEnvFile(filePath, key, value) {
  let content = fs.readFileSync(filePath, "utf8");

  const regex = new RegExp(`^${key}=.*$`, "m");

  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    // si NO quieres añadir la key automáticamente, comenta este bloque
    content += `\n${key}=${value}\n`;
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ actualizado → ${filePath}`);
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        walk(fullPath, files);
      }
    } else if (entry.isFile() && isEnvFile(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const latestBlock = await getLatestBlock();
  const blockNumber = latestBlock.number;

  console.log(`🔎 Último bloque: ${blockNumber}`);
  console.log("Buscando archivos .env...");

  const envFiles = walk(process.cwd());

  if (envFiles.length === 0) {
    console.warn("⚠️  No se encontraron archivos .env");
    return;
  }

  for (const file of envFiles) {
    const containsExcluded = IGNORED_ENVS.some((word) => file.includes(word));
    if (containsExcluded) {
      continue;
    }
    updateEnvFile(file, ENV_KEY, blockNumber);
  }

  console.log(`🎉 ${envFiles.length} archivos .env actualizados`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
