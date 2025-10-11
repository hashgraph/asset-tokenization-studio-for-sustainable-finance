import { ethers } from "hardhat";

export async function getProxyAdminOwnerEnv() {
  return await ethers.getSigner(process.env.PROXY_ADMIN_ADDRESS ?? (await ethers.getSigners())[0].address);
}

export async function getImplementationAddress(proxyAddress: string) {
  const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"; // ERC1967Upgrade _IMPLEMENTATION_SLOT
  const raw = await ethers.provider.getStorageAt(proxyAddress, IMPLEMENTATION_SLOT);
  return ethers.utils.getAddress("0x" + raw.slice(26));
}
