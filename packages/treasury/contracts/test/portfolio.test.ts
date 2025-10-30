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
import type { ITreasury } from '@contracts'
import { deployTreasury } from '../scripts/workflows/deployTreasury'

describe('Portfolio operations', () => {
    let signer_A, signer_B
    let treasury: ITreasury
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
        it('An account cannot initialize the Portfolio facet twice', async () => {
            await expect(
                treasury.initialize_Portfolio(paymentTokenAddress, [])
            ).to.be.revertedWithCustomError(treasury, 'AlreadyInitialized')
        })

        it('An account cannot initialize the Portfolio facet with the address zero as the payment token', async () => {
            await expect(
                treasury.initialize_Portfolio(AddressZero, [])
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })

        it('An account cannot initialize the Portfolio facet with an array of environmental assets containing a zero address', async () => {
            await expect(
                treasury.initialize_Portfolio(paymentTokenAddress, [
                    AddressZero,
                ])
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })
    })

    describe('addEnvironmentalAssetToken', () => {
        it('An account cannot add an EnvironmentalAssetToken if the contract is paused', async () => {
            await treasury.grantRole(PAUSER_ROLE, signer_A.address)
            await treasury.pause()

            await expect(
                treasury.addEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('An account not granted the PORTFOLIO_MANAGER_ROLE role cannot add an environmental asset', async () => {
            treasury = treasury.connect(signer_B)

            await expect(treasury.addEnvironmentalAssetToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_B.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('An account with the PORTFOLIO_MANAGER_ROLE role revoked cannot add an environmental asset', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await treasury.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)

            await expect(treasury.addEnvironmentalAssetToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_A.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('An account with the PORTFOLIO_MANAGER_ROLE role cannot add an environmental asset with zero address', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await expect(
                treasury.addEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })

        it('An account granted the PORTFOLIO_MANAGER_ROLE role can add an environmental asset', async () => {
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

        it('An account granted the PORTFOLIO_MANAGER_ROLE role cannot add an already existing environmental asset', async () => {
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
        it('An account cannot remove an EnvironmentalAssetToken if the contract is paused', async () => {
            await treasury.grantRole(PAUSER_ROLE, signer_A.address)
            await treasury.pause()

            await expect(
                treasury.removeEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('An account not granted the PORTFOLIO_MANAGER_ROLE role cannot remove an environmental asset', async () => {
            treasury = treasury.connect(signer_B)

            await expect(treasury.removeEnvironmentalAssetToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_B.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('An account with the PORTFOLIO_MANAGER_ROLE role revoked cannot remove an environmental asset', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await treasury.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)

            await expect(treasury.removeEnvironmentalAssetToken(AddressZero))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_A.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('An account with the PORTFOLIO_MANAGER_ROLE role cannot remove an environmental asset with zero address', async () => {
            await treasury.grantRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)
            await expect(
                treasury.removeEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })

        it('An account granted the PORTFOLIO_MANAGER_ROLE role can remove an environmental asset', async () => {
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
        it('An account cannot update the payment token if the contract is paused', async () => {
            portfolio = portfolio.connect(signer_A)

            await portfolio.pause()

            await expect(
                portfolio.updatePaymentToken(AddressZero)
            ).to.be.revertedWithCustomError(portfolio, 'TokenIsPaused')
        })

        it('An account not granted the PORTFOLIO_MANAGER_ROLE role cannot update the payment token', async () => {
            portfolio = portfolio.connect(signer_B)

            await expect(portfolio.updatePaymentToken(AddressZero))
                .to.be.revertedWithCustomError(portfolio, 'AccountHasNoRole')
                .withArgs(signer_B.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('An account with the PORTFOLIO_MANAGER_ROLE role revoked cannot update the payment token', async () => {
            portfolio = portfolio.connect(signer_A)

            await portfolio.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)

            await expect(portfolio.updatePaymentToken(AddressZero))
                .to.be.revertedWithCustomError(portfolio, 'AccountHasNoRole')
                .withArgs(signer_A.address, PORTFOLIO_MANAGER_ROLE)
        })

        it('An account with the PORTFOLIO_MANAGER_ROLE role cannot update the payment token with zero address', async () => {
            portfolio = portfolio.connect(signer_A)
            await expect(
                portfolio.updatePaymentToken(AddressZero)
            ).to.be.revertedWithCustomError(portfolio, 'InvalidAddressZero')
        })

        it('An account granted the PORTFOLIO_MANAGER_ROLE role can update the payment token', async () => {
            portfolio = portfolio.connect(signer_A)

            await portfolio.grantRole(PORTFOLIO_MANAGER_ROLE, signer_B.address)

            const [newPaymentTokenFactoryAddress, newPaymentTokenAddress] =
                await deployPaymentToken(signer_A, 100, 2)

            await expect(portfolio.updatePaymentToken(newPaymentTokenAddress))
                .to.emit(portfolio, 'PaymentTokenUpdated')
                .withArgs(
                    signer_A.address,
                    newPaymentTokenAddress,
                    paymentTokenAddress,
                    0
                )
        })
    })
})
