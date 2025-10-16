// SPDX-License-Identifier: Apache-2.0

import { ethers } from 'hardhat'

export async function deployContract(name, signer, args): Promise<string> {
    const contractFactory: Awaited<
        ReturnType<HardhatEthersHelpers['getContractFactory']>
    > = await ethers.getContractFactory(name, signer)
    const contract = await contractFactory.deploy(...args)
    const receipt = contract.deployTransaction.wait()
    return contract.address
}

export async function deployTreasury(signer, args): Promise<string> {
    const treasuryAddress = await deployContract(
        'TreasuryTestWrapper',
        signer,
        args
    )
    return await ethers.getContractAt('TreasuryTestWrapper', treasuryAddress)
}

export async function deployEnvironmentalAsset(
    signer
): Promise<[string, string, string]> {
    const environmentalAssetFactoryAddress = await deployContract(
        'EnvironmentalAssetFactory',
        signer,
        []
    )
    let environmentalAssetFactory: EnvironmentalAssetFactory =
        await ethers.getContractAt(
            'EnvironmentalAssetFactory',
            environmentalAssetFactoryAddress
        )
    environmentalAssetFactory = environmentalAssetFactory.connect(signer)
    const tx = await environmentalAssetFactory.createEnvironmentalAsset(
        'Sella River Clean',
        'SRC',
        { gasLimit: 800000, value: ethers.utils.parseEther('10') }
    )
    const receipt = await tx.wait()
    const EnvironmentalAssetCreatedEvent = receipt.events.find(
        (e) => e.event === 'EnvironmentalAssetCreated'
    )
    const NFTMintedEvent = receipt.events.find((e) => e.event === 'NFTMinted')
    return [
        environmentalAssetFactoryAddress,
        EnvironmentalAssetCreatedEvent.args.tokenAddress,
        NFTMintedEvent.args.tokenId,
    ]
}

export async function deployPaymentToken(
    signer,
    initialSupply,
    decimals
): Promise<[string, string]> {
    const paymentTokenFactoryAddress = await deployContract(
        'PaymentTokenFactory',
        signer,
        []
    )
    let paymentTokenFactory: PaymentTokenFactory = await ethers.getContractAt(
        'PaymentTokenFactory',
        paymentTokenFactoryAddress
    )
    paymentTokenFactory = paymentTokenFactory.connect(signer)
    const tx = await paymentTokenFactory.createPaymentToken(
        'Tadios Stable Coin',
        'TSC',
        initialSupply,
        decimals,
        { gasLimit: 1000000, value: ethers.utils.parseEther('10') }
    )
    const receipt = await tx.wait()
    const event = receipt.events.find((e) => e.event === 'PaymentTokenCreated')
    return [paymentTokenFactoryAddress, event.args.tokenAddress]
}
