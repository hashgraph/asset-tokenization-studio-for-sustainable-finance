import { ProxyAdmin } from "@contracts/index";
import { getProxyAdminOwnerEnv } from "@scripts/utils";
import { BaseContract } from "ethers";
import { Interface } from "ethers/lib/utils";
import { ethers } from "hardhat";

interface ProxyOptions {
  initializer?: string | false;
}

export async function deployProxy<C extends BaseContract>(
  proxyAdmin: ProxyAdmin,
  logicAddress: C,
  instanceOf: string,
  args: unknown[] = [],
  opts: ProxyOptions = {},
) {
  args = await Promise.all(args.map(processAddressableArgs));

  const contractInterface = (await ethers.getContractFactory(instanceOf))
    .interface;

  const initializeData = getInitializerData(
    contractInterface,
    args,
    opts.initializer,
  );

  const transparentProxy = await (
    await ethers.getContractFactory("TransparentUpgradeableProxy")
  ).deploy(logicAddress.address, proxyAdmin.address, initializeData);

  await transparentProxy.deployed();

  return ethers.getContractAt(instanceOf, transparentProxy.address);
}

export async function deployProxyAdmin(): Promise<ProxyAdmin> {
  const owner = await getProxyAdminOwnerEnv();

  const proxyAdmin = await (
    await ethers.getContractFactory("ProxyAdmin", owner)
  ).deploy();

  await proxyAdmin.deployed();

  return proxyAdmin;
}

async function processAddressableArgs(arg: unknown): Promise<unknown> {
  if (Array.isArray(arg)) {
    return Promise.all(arg.map(processAddressableArgs));
  } else if (
    // ethers v6 ethers => ethers.isAddressable(arg)
    arg &&
    typeof arg === "object" &&
    "getAddress" in arg &&
    typeof (arg as any).getAddress === "function"
  ) {
    return await (arg as any).getAddress();
  }
  return arg;
}

function getInitializerData(
  contractInterface: Interface,
  args: unknown[],
  initializer?: string | false,
): string {
  if (initializer === false) {
    return "0x";
  }

  const allowNoInitialization = initializer === undefined && args.length === 0;
  initializer = initializer ?? "initialize";

  const fragment = contractInterface.getFunction(initializer);
  if (fragment === null) {
    if (allowNoInitialization) {
      return "0x";
    } else {
      throw new Error(
        `Ensure that the ${initializer} function exists, specify an existing function with the 'initializer' option, or set the 'initializer' option to false to omit the initializer call.`,
      );
    }
  } else {
    return contractInterface.encodeFunctionData(fragment, args);
  }
}
