// SPDX-License-Identifier: Apache-2.0

import { ethers } from 'hardhat'

export async function deployContract(name, signer, args): Promise<string> {
    const contractFactory: Awaited<
      ReturnType<HardhatEthersHelpers["getContractFactory"]>
    > = await ethers.getContractFactory(name, signer);
    const contract = await contractFactory.deploy(...args)
    const receipt = contract.deployTransaction.wait()
    return contract.address;
}

export async function deployEnvironmentalAsset(signer):Promise<string> {
    const environmentalAssetFactoryAddress = await deployContract(
      'EnvironmentalAssetFactory', signer, []
    );
    let environmentalAssetFactory: EnvironmentalAssetFactory = await ethers.getContractAt(
      'EnvironmentalAssetFactory', environmentalAssetFactoryAddress
    );
    environmentalAssetFactory = environmentalAssetFactory.connect(signer);
    const tx = await environmentalAssetFactory.createEnvironmentalAsset(
      'Sella River Clean', 'SRC', {value: ethers.utils.parseEther("10")});
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === "TokenCreated");
    return event.args.tokenAddress;
}

