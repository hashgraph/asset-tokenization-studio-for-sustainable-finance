// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { AddressZero } from '@ethersproject/constants'
import { type TreasuryTestWrapper } from '@typechain'
import { FUNDS_MANAGER_ROLE, PROCEEDS_FULL_MANAGER } from '../scripts/constants'
import {
    deployTreasury,
    deployPaymentToken,
    deployEnvironmentalAsset,
} from '../scripts/deploy'

let signer_A, signer_B
let treasury: TreasuryTestWrapper
let environmentalAssetFactoryAddress: string
let environmentalAssetAddress: string
let paymentTokenFactoryAddress: string
let paymentTokenAddress: string
let tokenId: string

describe('Proceeds management operations', () => {
    before(() => {
        // mute | mock console.log
        console.log = () => {}
    })

    const hre = require('hardhat')
    const hreConfig = hre.network.config

    beforeEach(async () => {
        ;[signer_A, signer_B] = await ethers.getSigners()
        treasury = await deployTreasury(signer_A, [])
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
            treasury = treasury.connect(signer_A)

            await treasury.pause()

            await expect(
                treasury.transferPaymentToken(AddressZero, 1)
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('An account not granted the PROCEEDS_FULL_MANAGER role cannot transfer payment token', async () => {
            treasury = treasury.connect(signer_B)
            await expect(
                treasury.transferPaymentToken(AddressZero, 1)
            ).to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
        })

        it('An account with the PROCEEDS_FULL_MANAGER role revoked cannot transfer payment token', async () => {
            treasury = treasury.connect(signer_A)

            await treasury.revokeRole(PROCEEDS_FULL_MANAGER, signer_A.address)

            await expect(
                treasury.transferPaymentToken(AddressZero, 1)
            ).to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
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

        it('An account with the PROCEEDS_FULL_MANAGER role cannot transfer more payment tokens than the Treasury owns', async () => {
            treasury = treasury.connect(signer_A)
            await expect(treasury.transferPaymentToken(signer_A.address, 200))
                .to.be.revertedWithCustomError(treasury, 'NotEnoughBalance')
                .withArgs(200)
        })

        it('An account with the PROCEEDS_FULL_MANAGER role cannot transfer payment tokens to address zero', async () => {
            treasury = treasury.connect(signer_A)

            await expect(treasury.transferPaymentToken(AddressZero, 100))
                .to.be.revertedWithCustomError(
                    treasury,
                    'TransferPaymentTokenFailed'
                )
                .withArgs(AddressZero, 100)
        })

        it('An account with the PROCEEDS_FULL_MANAGER role cannot transfer an amount of payment tokens exceeding 9223372036854775807', async () => {
            treasury = treasury.connect(signer_A)

            await expect(
                treasury.transferPaymentToken(
                    signer_A.address,
                    BigNumber.from('9223372036854775808')
                )
            )
                .to.be.revertedWithCustomError(treasury, 'NotAllowedAmount')
                .withArgs(9223372036854775808n)
        })

        it('An account with the PROCEEDS_FULL_MANAGER role can transfer payment tokens', async () => {
            treasury = treasury.connect(signer_A)
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
            treasury = treasury.connect(signer_A)

            await treasury.pause()

            await expect(
                treasury.transferEnvironmentalAssetToken(
                    AddressZero,
                    AddressZero,
                    1
                )
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('An account not granted the PROCEEDS_FULL_MANAGER role cannot transfer an environmental asset token', async () => {
            treasury = treasury.connect(signer_B)

            await expect(
                treasury.transferEnvironmentalAssetToken(
                    AddressZero,
                    AddressZero,
                    1
                )
            ).to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
        })

        it('An account with the PROCEEDS_FULL_MANAGER role revoked cannot transfer an environmental asset token', async () => {
            treasury = treasury.connect(signer_A)

            await treasury.revokeRole(PROCEEDS_FULL_MANAGER, signer_A.address)

            await expect(
                treasury.transferEnvironmentalAssetToken(
                    AddressZero,
                    AddressZero,
                    1
                )
            ).to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
        })

        it('An account with the PROCEEDS_FULL_MANAGER role cannot transfer a environmental asset token that does not own', async () => {
            treasury = treasury.connect(signer_A)

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

        it('An account with the PROCEEDS_FULL_MANAGER role cannot transfer an invalid NFT id', async () => {
            treasury = treasury.connect(signer_A)

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

        it('An account with the PROCEEDS_FULL_MANAGER role cannot transfer an environmental asset with a serial number greater than 9223372036854775807', async () => {
            treasury = treasury.connect(signer_A)

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

        it('An account with the PROCEEDS_FULL_MANAGER role can transfer an environmental asset token', async () => {
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

            treasury = treasury.connect(signer_A)

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
            treasury = treasury.connect(signer_A)

            await treasury.pause()

            await expect(
                treasury.fundProceedsRecipient(AddressZero, 1)
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('An account not granted the FUNDS_MANAGER_ROLE role cannot fund a proceeds management', async () => {
            treasury = treasury.connect(signer_B)

            await expect(
                treasury.fundProceedsRecipient(AddressZero, 1)
            ).to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
        })

        it('An account with the FUNDS_MANAGER_ROLE role revoked cannot fund a proceeds recipient', async () => {
            treasury = treasury.connect(signer_A)

            await treasury.revokeRole(FUNDS_MANAGER_ROLE, signer_A.address)

            await expect(
                treasury.fundProceedsRecipient(AddressZero, 1)
            ).to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
        })

        // Falta subir la comprobación en una nueva release de ATS
        it.skip('An account with the PROCEEDS_FULL_MANAGER role cannot fund a proceeds recipient if this does not belong to the bond', async () => {
            treasury = treasury.connect(signer_A)
            const proceedsRecipient = signer_A.address

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

        it('An account with the PROCEEDS_FULL_MANAGER role cannot fund a proceeds recipient with more payment tokens than the Treasury owns', async () => {
            treasury = treasury.connect(signer_A)
            // TODO: Change to a valid proceeds recipient belonging to the bond
            const proceedsRecipient = signer_A.address

            await expect(treasury.fundProceedsRecipient(proceedsRecipient, 200))
                .to.be.revertedWithCustomError(treasury, 'NotEnoughBalance')
                .withArgs(200)
        })

        it('An account with the PROCEEDS_FULL_MANAGER role cannot fund a proceeds recipient with address zero', async () => {
            treasury = treasury.connect(signer_A)

            await expect(treasury.fundProceedsRecipient(AddressZero, 100))
                .to.be.revertedWithCustomError(
                    treasury,
                    'TransferPaymentTokenFailed'
                )
                .withArgs(AddressZero, 100)
        })

        it('An account with the PROCEEDS_FULL_MANAGER role cannot fund a proceeds recipient with an amount exceeding 9223372036854775807', async () => {
            treasury = treasury.connect(signer_A)
            // TODO: Change to a valid proceeds recipient belonging to the bond
            const proceedsRecipient = signer_A.address

            await expect(
                treasury.fundProceedsRecipient(
                    proceedsRecipient,
                    BigNumber.from('9223372036854775808')
                )
            )
                .to.be.revertedWithCustomError(treasury, 'NotAllowedAmount')
                .withArgs(9223372036854775808n)
        })

        it('An account with the PROCEEDS_FULL_MANAGER role can fund a proceeds recipient belonging to the bond', async () => {
            treasury = treasury.connect(signer_A)
            // TODO: Change to a valid proceeds recipient belonging to the bond
            const proceedsRecipient = signer_A.address

            await expect(treasury.fundProceedsRecipient(proceedsRecipient, 100))
                .to.emit(treasury, 'ProceedsRecipientFunded')
                .withArgs(proceedsRecipient, 100)
        })
    })
})
