// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { AddressZero } from '@ethersproject/constants'
import {
    PAUSER_ROLE,
    FUNDS_MANAGER_ROLE,
    PROCEEDS_FULL_MANAGER_ROLE,
} from '../scripts/constants'
import { deployPaymentToken, deployEnvironmentalAsset } from '../scripts/deploy'
import { HardhatProvider } from '@hashgraph/asset-tokenization-contracts/scripts'
import type { ITreasury } from '@contracts'
import { deployTreasury } from '../scripts/workflows/deployTreasury'

describe('Proceeds management operations', () => {
    let signer_A, signer_B
    let treasury: ITreasury
    let environmentalAssetFactoryAddress: string
    let environmentalAssetAddress: string
    let paymentTokenFactoryAddress: string
    let paymentTokenAddress: string
    let tokenId: string

    beforeEach(async () => {
        ;[signer_A, signer_B] = await ethers.getSigners()
        const provider = new HardhatProvider()
        const deployment = await deployTreasury(provider, 'hardhat', {
            useTimeTravel: false,
            saveOutput: false,
        })

        treasury = (await ethers.getContractAt(
            'ITreasury',
            deployment.infrastructure.treasury.proxy
        )) as ITreasury
        ;[paymentTokenFactoryAddress, paymentTokenAddress] =
            await deployPaymentToken(signer_A, 100, 2)
        ;[
            environmentalAssetFactoryAddress,
            environmentalAssetAddress,
            tokenId,
        ] = await deployEnvironmentalAsset(signer_A)

        treasury = treasury.connect(signer_A)
        await treasury.initialize_Portfolio(paymentTokenAddress, [
            environmentalAssetAddress,
        ])
    })

    describe('transferPaymentToken', () => {
        it('An account cannot transfer payment token if the contract is paused', async () => {
            await treasury.grantRole(PAUSER_ROLE, signer_A.address)
            await treasury.pause()

            await expect(
                treasury.transferPaymentToken(AddressZero, 1)
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('An account not granted the PROCEEDS_FULL_MANAGER_ROLE role cannot transfer payment token', async () => {
            treasury = treasury.connect(signer_B)
            await expect(treasury.transferPaymentToken(AddressZero, 1))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_B.address, PROCEEDS_FULL_MANAGER_ROLE)
        })

        it('An account with the PROCEEDS_FULL_MANAGER_ROLE role revoked cannot transfer payment token', async () => {
            await treasury.grantRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )
            await treasury.revokeRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )

            await expect(treasury.transferPaymentToken(AddressZero, 1))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_A.address, PROCEEDS_FULL_MANAGER_ROLE)
        })

        beforeEach(async () => {
            let paymentTokenFactory = await ethers.getContractAt(
                'PaymentTokenFactory',
                paymentTokenFactoryAddress
            )
            paymentTokenFactory = paymentTokenFactory.connect(signer_A)
            await paymentTokenFactory.transferPaymentToken(
                paymentTokenAddress,
                treasury.address,
                100
            )
        })

        it('An account with the PROCEEDS_FULL_MANAGER_ROLE role cannot transfer more payment tokens than the Treasury owns', async () => {
            await treasury.grantRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )

            await expect(treasury.transferPaymentToken(signer_A.address, 200))
                .to.be.revertedWithCustomError(treasury, 'NotEnoughBalance')
                .withArgs(200)
        })

        it('An account with the PROCEEDS_FULL_MANAGER_ROLE role cannot transfer payment tokens to address zero', async () => {
            await treasury.grantRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )

            await expect(treasury.transferPaymentToken(AddressZero, 100))
                .to.be.revertedWithCustomError(
                    treasury,
                    'TransferPaymentTokenFailed'
                )
                .withArgs(AddressZero, 100)
        })

        it('An account with the PROCEEDS_FULL_MANAGER_ROLE role cannot transfer an amount of payment tokens exceeding 9223372036854775807', async () => {
            await treasury.grantRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )

            await expect(
                treasury.transferPaymentToken(
                    signer_A.address,
                    BigNumber.from('9223372036854775808')
                )
            )
                .to.be.revertedWithCustomError(treasury, 'NotAllowedAmount')
                .withArgs(9223372036854775808n)
        })

        it('An account with the PROCEEDS_FULL_MANAGER_ROLE role can transfer payment tokens', async () => {
            await treasury.grantRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )
            await expect(
                treasury.transferPaymentToken(signer_A.address, 100, {
                    gasLimit: 2000000,
                })
            )
                .to.emit(treasury, 'PaymentTokenTransferred')
                .withArgs(signer_A.address, 100)
        })
    })

    describe('transferEnvironmentalAssetToken', () => {
        it('An account cannot transfer an environmental asset token if the contract is paused', async () => {
            await treasury.grantRole(PAUSER_ROLE, signer_A.address)
            await treasury.pause()

            await expect(
                treasury.transferEnvironmentalAssetToken(
                    AddressZero,
                    AddressZero,
                    1
                )
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('An account not granted the PROCEEDS_FULL_MANAGER_ROLE role cannot transfer an environmental asset token', async () => {
            treasury = treasury.connect(signer_B)

            await expect(
                treasury.transferEnvironmentalAssetToken(
                    AddressZero,
                    AddressZero,
                    1
                )
            )
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_B.address, PROCEEDS_FULL_MANAGER_ROLE)
        })

        it('An account with the PROCEEDS_FULL_MANAGER_ROLE role revoked cannot transfer an environmental asset token', async () => {
            await treasury.grantRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )
            await treasury.revokeRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )

            await expect(
                treasury.transferEnvironmentalAssetToken(
                    AddressZero,
                    AddressZero,
                    1
                )
            )
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_A.address, PROCEEDS_FULL_MANAGER_ROLE)
        })

        it('An account with the PROCEEDS_FULL_MANAGER_ROLE role cannot transfer a environmental asset token that does not own', async () => {
            await treasury.grantRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )

            await expect(
                treasury.transferEnvironmentalAssetToken(
                    environmentalAssetAddress,
                    signer_A.address,
                    tokenId
                )
            )
                .to.be.revertedWithCustomError(treasury, 'NotTokenIdOwner')
                .withArgs(tokenId)
        })

        it('An account with the PROCEEDS_FULL_MANAGER_ROLE role cannot transfer an invalid NFT id', async () => {
            await treasury.grantRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )

            await expect(
                treasury.transferEnvironmentalAssetToken(
                    environmentalAssetAddress,
                    signer_A.address,
                    346346
                )
            )
                .to.be.revertedWithCustomError(
                    treasury,
                    'TransferEnvironmentalAssetTokenFailed'
                )
                .withArgs(environmentalAssetAddress, signer_A.address, 346346)
        })

        it('An account with the PROCEEDS_FULL_MANAGER_ROLE role cannot transfer an environmental asset with a serial number greater than 9223372036854775807', async () => {
            await treasury.grantRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )

            await expect(
                treasury.transferEnvironmentalAssetToken(
                    environmentalAssetAddress,
                    signer_A.address,
                    BigNumber.from('9223372036854775808')
                )
            )
                .to.be.revertedWithCustomError(
                    treasury,
                    'NotAllowedSerialNumber'
                )
                .withArgs(9223372036854775808n)
        })

        it('An account with the PROCEEDS_FULL_MANAGER_ROLE role can transfer an environmental asset token', async () => {
            await treasury.grantRole(
                PROCEEDS_FULL_MANAGER_ROLE,
                signer_A.address
            )
            let environmentalAssetFactory = await ethers.getContractAt(
                'EnvironmentalAssetFactory',
                environmentalAssetFactoryAddress
            )
            environmentalAssetFactory =
                environmentalAssetFactory.connect(signer_A)
            await environmentalAssetFactory.transferEnvironmentalAssetToken(
                environmentalAssetAddress,
                treasury.address,
                tokenId
            )

            await expect(
                treasury.transferEnvironmentalAssetToken(
                    environmentalAssetAddress,
                    signer_A.address,
                    tokenId
                )
            )
                .to.emit(treasury, 'EnvironmentalAssetTokenTransferred')
                .withArgs(environmentalAssetAddress, signer_A.address, tokenId)
        })
    })

    describe('fundProceedsRecipient', () => {
        it('An account cannot fund a proceeds recipient if the contract is paused', async () => {
            await treasury.grantRole(PAUSER_ROLE, signer_A.address)
            await treasury.pause()

            await expect(
                treasury.fundProceedsRecipient(AddressZero, 1)
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('An account not granted the FUNDS_MANAGER_ROLE role cannot fund a proceeds management', async () => {
            treasury = treasury.connect(signer_B)

            await expect(treasury.fundProceedsRecipient(AddressZero, 1))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_B.address, FUNDS_MANAGER_ROLE)
        })

        it('An account with the FUNDS_MANAGER_ROLE role revoked cannot fund a proceeds recipient', async () => {
            await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address)
            await treasury.revokeRole(FUNDS_MANAGER_ROLE, signer_A.address)

            await expect(treasury.fundProceedsRecipient(AddressZero, 1))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_A.address, FUNDS_MANAGER_ROLE)
        })

        // Falta subir la comprobación en una nueva release de ATS
        it.skip('An account with the FUNDS_MANAGER_ROLE role cannot fund a proceeds recipient if this does not belong to the bond', async () => {
            const proceedsRecipient = signer_A.address

            await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address)

            await expect(treasury.fundProceedsRecipient(proceedsRecipient, 1))
                .to.be.revertedWithCustomError(
                    treasury,
                    'WrongProceedsRecipient'
                )
                .withArgs(proceedsRecipient)
        })

        beforeEach(async () => {
            let paymentTokenFactory = await ethers.getContractAt(
                'PaymentTokenFactory',
                paymentTokenFactoryAddress
            )
            paymentTokenFactory = paymentTokenFactory.connect(signer_A)
            await paymentTokenFactory.transferPaymentToken(
                paymentTokenAddress,
                treasury.address,
                100
            )
        })

        it('An account with the FUNDS_MANAGER_ROLE role cannot fund a proceeds recipient with more payment tokens than the Treasury owns', async () => {
            // TODO: Change to a valid proceeds recipient belonging to the bond
            const proceedsRecipient = signer_A.address
            await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address)

            await expect(treasury.fundProceedsRecipient(proceedsRecipient, 200))
                .to.be.revertedWithCustomError(treasury, 'NotEnoughBalance')
                .withArgs(200)
        })

        it('An account with the FUNDS_MANAGER_ROLE role cannot fund a proceeds recipient with address zero', async () => {
            await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address)

            await expect(treasury.fundProceedsRecipient(AddressZero, 100))
                .to.be.revertedWithCustomError(
                    treasury,
                    'TransferPaymentTokenFailed'
                )
                .withArgs(AddressZero, 100)
        })

        it('An account with the FUNDS_MANAGER_ROLE role cannot fund a proceeds recipient with an amount exceeding 9223372036854775807', async () => {
            // TODO: Change to a valid proceeds recipient belonging to the bond
            const proceedsRecipient = signer_A.address
            await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address)

            await expect(
                treasury.fundProceedsRecipient(
                    proceedsRecipient,
                    BigNumber.from('9223372036854775808')
                )
            )
                .to.be.revertedWithCustomError(treasury, 'NotAllowedAmount')
                .withArgs(9223372036854775808n)
        })

        it('An account with the FUNDS_MANAGER_ROLE role can fund a proceeds recipient belonging to the bond', async () => {
            // TODO: Change to a valid proceeds recipient belonging to the bond
            const proceedsRecipient = signer_A.address
            await treasury.grantRole(FUNDS_MANAGER_ROLE, signer_A.address)

            await expect(treasury.fundProceedsRecipient(proceedsRecipient, 100))
                .to.emit(treasury, 'ProceedsRecipientFunded')
                .withArgs(proceedsRecipient, 100)
        })
    })
})
