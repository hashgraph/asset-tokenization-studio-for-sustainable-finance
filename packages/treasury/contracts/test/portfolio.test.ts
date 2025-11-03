// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { AddressZero } from '@ethersproject/constants'
import { PAUSER_ROLE, PORTFOLIO_MANAGER_ROLE } from '../scripts/constants'
import {
    deployContract,
    deployPaymentToken,
    deployEnvironmentalAsset,
} from '../scripts/test/deploy'
import { HardhatProvider } from '@hashgraph/asset-tokenization-contracts/scripts'
import type { ITreasury, IPaymentTokenFactory } from '@contracts'
import { deployTreasury } from '../scripts/workflows/deployTreasury'

describe('Portfolio operations', () => {
    let signer_A, signer_B
    let treasury: ITreasury
    let paymentTokenFactory: IPaymentTokenFactory
    let paymentTokenFactoryAddress: string
    let paymentTokenAddress: string

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

        treasury = treasury.connect(signer_A)
        await treasury.initialize_Portfolio(paymentTokenAddress, [])
    })

    describe('initialize_Portfolio', () => {
        it('GIVEN an already initialized Portfolio facet, WHEN initializing once again, THEN an AlreadyInitialized error occurs', async () => {
            await expect(
                treasury.initialize_Portfolio(paymentTokenAddress, [])
            ).to.be.revertedWithCustomError(treasury, 'AlreadyInitialized')
        })

        it('GIVEN a Portfolio facet, WHEN initializing with a zero address payment token, THEN an InvalidAddressZero error occurs', async () => {
            await expect(
                treasury.initialize_Portfolio(AddressZero, [])
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })

        it('GIVEN a Portfolio facet, WHEN initializing with address zero environmental assets, THEN an InvalidAddressZero error occurs', async () => {
            await expect(
                treasury.initialize_Portfolio(paymentTokenAddress, [
                    AddressZero,
                ])
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })
    })

    describe('addEnvironmentalAssetToken', () => {
        it('GIVEN a deployed Treasury contract, WHEN the contract is paused and adds an environmental asset token, THEN a TokenIsPaused error occurs', async () => {
            await treasury.grantRole(PAUSER_ROLE, signer_A.address)
            await treasury.pause()

            await expect(
                treasury.addEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('GIVEN a deployed Treasury contract, WHEN an account not granted the PORTFOLIO_MANAGER_ROLE adds an environmental asset token, THEN an AccountHasNoRole error occurs', async () => {
            treasury = treasury.connect(signer_B)

            await expect(treasury.addEnvironmentalAssetToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_B.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('GIVEN a deployed Treasury contract, WHEN an account having the PORTFOLIO_MANAGER_ROLE revoked adds an environmental asset token, THEN an AccountHasNoRole error occurs', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await treasury.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)

            await expect(treasury.addEnvironmentalAssetToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_A.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE adds zero address environmental asset token, THEN an InvalidAddressZero error occurs', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await expect(
                treasury.addEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })

        it('GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE adds an environmental asset token, THEN the environmental asset token is added', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_B.address)

            const [
                environmentalAssetFactoryAddress,
                environmentalAssetAddress,
                tokenId,
            ] = await deployEnvironmentalAsset(signer_A)

            treasury = treasury.connect(signer_B)

            await expect(
                treasury.addEnvironmentalAssetToken(environmentalAssetAddress)
            )
                .to.emit(treasury, 'TokenAssociated')
                .withArgs(environmentalAssetAddress)
                .to.emit(treasury, 'EnvironmentalAssetAdded')
                .withArgs(signer_B.address, environmentalAssetAddress)

            expect(await treasury.getTotalEnvironmentalAssetTokens()).to.equal(
                1
            )
        })

        it('GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE adds an already added environmental asset token, THEN TokenAssociated and EnvironmentalAssetAdded events are not emitted', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_B.address)

            const [
                environmentalAssetFactoryAddress,
                environmentalAssetAddress,
                tokenId,
            ] = await deployEnvironmentalAsset(signer_A)

            treasury = treasury.connect(signer_B)

            await treasury.addEnvironmentalAssetToken(environmentalAssetAddress)

            await expect(
                treasury.addEnvironmentalAssetToken(environmentalAssetAddress)
            )
                .to.not.emit(treasury, 'TokenAssociated')
                .to.not.emit(treasury, 'EnvironmentalAssetAdded')

            expect(await treasury.getTotalEnvironmentalAssetTokens()).to.equal(
                1
            )
        })
    })

    describe('removeEnvironmentalAssetToken', () => {
        it('GIVEN a deployed Treasury contract, WHEN the contract is paused and removes an environmental asset token, THEN a TokenIsPaused error occurs', async () => {
            await treasury.grantRole(PAUSER_ROLE, signer_A.address)
            await treasury.pause()

            await expect(
                treasury.removeEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('GIVEN a deployed Treasury contract, WHEN an account not granted the PORTFOLIO_MANAGER_ROLE removes an environmental asset token, THEN an AccountHasNoRole error occurs', async () => {
            treasury = treasury.connect(signer_B)

            await expect(treasury.removeEnvironmentalAssetToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_B.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('GIVEN a deployed Treasury contract, WHEN an account having the PORTFOLIO_MANAGER_ROLE revoked removes an environmental asset token, THEN an AccountHasNoRole error occurs', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await treasury.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)

            await expect(treasury.removeEnvironmentalAssetToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_A.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE removes a zero address environmental asset token, THEN an InvalidAddressZero error occurs', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await expect(
                treasury.removeEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })

        it('GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE removes an environmental asset token, THEN the environmental asset token is removed', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_B.address)

            const [
                environmentalAssetFactoryAddress,
                environmentalAssetAddress,
                tokenId,
            ] = await deployEnvironmentalAsset(signer_A)

            treasury = treasury.connect(signer_B)

            await treasury.addEnvironmentalAssetToken(environmentalAssetAddress)

            expect(await treasury.getTotalEnvironmentalAssetTokens()).to.equal(
                1
            )

            await expect(
                treasury.removeEnvironmentalAssetToken(
                    environmentalAssetAddress
                )
            )
                .to.emit(treasury, 'EnvironmentalAssetRemoved')
                .withArgs(signer_B.address, environmentalAssetAddress, 0)

            expect(await treasury.getTotalEnvironmentalAssetTokens()).to.equal(
                0
            )
        })
    })

    describe('updatePaymentToken', () => {
        it('GIVEN a deployed Treasury contract, WHEN the contract is paused and updates the payment token, THEN a TokenIsPaused error occurs', async () => {
            await treasury.grantRole(PAUSER_ROLE, signer_A.address)
            await treasury.pause()

            await expect(
                treasury.updatePaymentToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('GIVEN a deployed Treasury contract, WHEN an account not granted the PORTFOLIO_MANAGER_ROLE updates the payment token, THEN an AccountHasNoRole error occurs', async () => {
            treasury = treasury.connect(signer_B)

            await expect(treasury.updatePaymentToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_B.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('GIVEN a deployed Treasury contract, WHEN an account having the PORTFOLIO_MANAGER_ROLE revoked updates the payment token, THEN an AccountHasNoRole error occurs', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await treasury.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)

            await expect(treasury.updatePaymentToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_A.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE updates the payment token with a zero address token, THEN an InvalidAddressZero error occurs', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await expect(
                treasury.updatePaymentToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })

        it('GIVEN a treasury with a balance of 1 payment token, WHEN updating the payment token, THEN a PaymentTokenUpdated event is emitted with a 195 dissociation code error', async () => {
            paymentTokenFactory = await ethers.getContractAt(
                'PaymentTokenFactory',
                paymentTokenFactoryAddress
            )
            paymentTokenFactory = paymentTokenFactory.connect(signer_A)
            await paymentTokenFactory.transferPaymentToken(
                paymentTokenAddress,
                treasury.address,
                1
            )

            const [newPaymentTokenFactoryAddress, newPaymentTokenAddress] =
                await deployPaymentToken(signer_A, 100, 2)

            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)

            await expect(treasury.updatePaymentToken(newPaymentTokenAddress))
                .to.emit(treasury, 'PaymentTokenUpdated')
                .withArgs(
                    signer_A.address,
                    newPaymentTokenAddress,
                    paymentTokenAddress,
                    195
                )
        })

        it('GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE updates the payment token, THEN the payment token is updated', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)

            const [newPaymentTokenFactoryAddress, newPaymentTokenAddress] =
                await deployPaymentToken(signer_A, 100, 2)

            await expect(treasury.updatePaymentToken(newPaymentTokenAddress))
                .to.emit(treasury, 'PaymentTokenUpdated')
                .withArgs(
                    signer_A.address,
                    newPaymentTokenAddress,
                    paymentTokenAddress,
                    0
                )
        })
    })

    describe('dissociateToken', () => {
        it.only('GIVEN a deployed Treasury contract, WHEN the contract is paused and dissociates the payment token, THEN a TokenIsPaused error occurs', async () => {
            await treasury.grantRole(PAUSER_ROLE, signer_A.address)
            await treasury.pause()

            await expect(
                treasury.dissociateToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it.only('GIVEN a deployed Treasury contract, WHEN an account not granted the PORTFOLIO_MANAGER_ROLE dissociates the payment token, THEN an AccountHasNoRole error occurs', async () => {
            treasury = treasury.connect(signer_B)

            await expect(treasury.dissociateToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_B.address, PORTFOLIO_MANAGER_ROLE)
        })

        it.only('GIVEN a deployed Treasury contract, WHEN an account having the PORTFOLIO_MANAGER_ROLE revoked dissociates the payment token, THEN an AccountHasNoRole error occurs', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await treasury.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)

            await expect(treasury.dissociateToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_A.address, PORTFOLIO_MANAGER_ROLE)
        })

        it.only('GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE dissociates a zero address token, THEN an InvalidAddressZero error occurs', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await expect(
                treasury.dissociateToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })

        it.only('GIVEN a deployed Treasury contract, WHEN an account granting the PORTFOLIO_MANAGER_ROLE dissociates the payment token, THEN a TokenDissociated event is emitted', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await expect(treasury.dissociateToken(paymentTokenAddress))
                .to.emit(treasury, 'TokenDissociated')
                .withArgs(paymentTokenAddress)
        })
    })
})
