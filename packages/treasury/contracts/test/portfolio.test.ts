// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { AddressZero } from '@ethersproject/constants'
import { type PortfolioFacet } from '@typechain'
import { PORTFOLIO_MANAGER_ROLE } from '../scripts/constants'
import {
    deployContract,
    deployPaymentToken,
    deployEnvironmentalAsset,
} from '../scripts/deploy'

let signer_A, signer_B
let portfolio: PortfolioFacet
let paymentTokenFactoryAddress: string
let paymentTokenAddress: string

describe('Portfolio operations', () => {
    before(() => {
        // mute | mock console.log
        console.log = () => {}
    })

    const hre = require('hardhat')
    const hreConfig = hre.network.config

    beforeEach(async () => {
        ;[signer_A, signer_B] = await ethers.getSigners()
        const portfolioAddress = await deployContract(
            'PortfolioFacet',
            signer_A,
            []
        )

        ;[paymentTokenFactoryAddress, paymentTokenAddress] =
            await deployPaymentToken(signer_A, 100, 2)

        portfolio = await ethers.getContractAt(
            'PortfolioFacet',
            portfolioAddress
        )
        portfolio = portfolio.connect(signer_A)
        await portfolio.initialize_Portfolio(paymentTokenAddress, [])
    })

    describe('initialize_Portfolio', () => {
        it('An account cannot initialize the Portfolio facet twice', async () => {
            await expect(
                portfolio.initialize_Portfolio(paymentTokenAddress, [])
            ).to.be.revertedWithCustomError(portfolio, 'AlreadyInitialized')
        })

        it('An account cannot initialize the Portfolio facet with the address zero as the payment token', async () => {
            await expect(
                portfolio.initialize_Portfolio(AddressZero, [])
            ).to.be.revertedWithCustomError(portfolio, 'InvalidAddressZero')
        })

        it('An account cannot initialize the Portfolio facet with an array of environmental assets containing a zero address', async () => {
            await expect(
                portfolio.initialize_Portfolio(paymentTokenAddress, [
                    AddressZero,
                ])
            ).to.be.revertedWithCustomError(portfolio, 'InvalidAddressZero')
        })
    })

    describe('addEnvironmentalAssetToken', () => {
        it('An account cannot add an EnvironmentalAssetToken if the contract is paused', async () => {
            portfolio = portfolio.connect(signer_A)

            await portfolio.pause()

            await expect(
                portfolio.addEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(portfolio, 'TokenIsPaused')
        })

        it('An account not granted the PORTFOLIO_MANAGER_ROLE role cannot add an environmental asset', async () => {
            portfolio = portfolio.connect(signer_B)

            await expect(
                portfolio.addEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(portfolio, 'AccountHasNoRole')
        })

        it('An account with the PORTFOLIO_MANAGER_ROLE role revoked cannot add an environmental asset', async () => {
            portfolio = portfolio.connect(signer_A)

            await portfolio.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)

            await expect(
                portfolio.addEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(portfolio, 'AccountHasNoRole')
        })

        it('An account with the PORTFOLIO_MANAGER_ROLE role cannot add an environmental asset with zero address', async () => {
            portfolio = portfolio.connect(signer_A)
            await expect(
                portfolio.addEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(portfolio, 'InvalidAddressZero')
        })

        it('An account granted the PORTFOLIO_MANAGER_ROLE role can add an environmental asset', async () => {
            portfolio = portfolio.connect(signer_A)

            await portfolio.grantRole(PORTFOLIO_MANAGER_ROLE, signer_B.address)

            const [
                environmentalAssetFactoryAddress,
                environmentalAssetAddress,
                tokenId,
            ] = await deployEnvironmentalAsset(signer_A)

            portfolio = portfolio.connect(signer_B)

            await expect(
                portfolio.addEnvironmentalAssetToken(environmentalAssetAddress)
            )
                .to.emit(portfolio, 'TokenAssociated')
                .withArgs(environmentalAssetAddress)
                .to.emit(portfolio, 'EnvironmentalAssetAdded')
                .withArgs(signer_B.address, environmentalAssetAddress)

            expect(await portfolio.getTotalEnvironmentalAssetTokens()).to.equal(
                1
            )
        })

        it('An account granted the PORTFOLIO_MANAGER_ROLE role cannot add an already existing environmental asset', async () => {
            portfolio = portfolio.connect(signer_A)

            await portfolio.grantRole(PORTFOLIO_MANAGER_ROLE, signer_B.address)

            const [
                environmentalAssetFactoryAddress,
                environmentalAssetAddress,
                tokenId,
            ] = await deployEnvironmentalAsset(signer_A)

            portfolio = portfolio.connect(signer_B)

            await portfolio.addEnvironmentalAssetToken(
                environmentalAssetAddress
            )

            await expect(
                portfolio.addEnvironmentalAssetToken(environmentalAssetAddress)
            )
                .to.not.emit(portfolio, 'TokenAssociated')
                .to.not.emit(portfolio, 'EnvironmentalAssetAdded')

            expect(await portfolio.getTotalEnvironmentalAssetTokens()).to.equal(
                1
            )
        })
    })

    describe('removeEnvironmentalAssetToken', () => {
        it('An account cannot remove an EnvironmentalAssetToken if the contract is paused', async () => {
            portfolio = portfolio.connect(signer_A)

            await portfolio.pause()

            await expect(
                portfolio.removeEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(portfolio, 'TokenIsPaused')
        })

        it('An account not granted the PORTFOLIO_MANAGER_ROLE role cannot remove an environmental asset', async () => {
            portfolio = portfolio.connect(signer_B)

            await expect(
                portfolio.removeEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(portfolio, 'AccountHasNoRole')
        })

        it('An account with the PORTFOLIO_MANAGER_ROLE role revoked cannot remove an environmental asset', async () => {
            portfolio = portfolio.connect(signer_A)

            await portfolio.revokeRole(PORTFOLIO_MANAGER_ROLE, signer_A.address)

            await expect(
                portfolio.removeEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(portfolio, 'AccountHasNoRole')
        })

        it('An account with the PORTFOLIO_MANAGER_ROLE role cannot remove an environmental asset with zero address', async () => {
            portfolio = portfolio.connect(signer_A)
            await expect(
                portfolio.removeEnvironmentalAssetToken(AddressZero)
            ).to.be.revertedWithCustomError(portfolio, 'InvalidAddressZero')
        })

        it('An account granted the PORTFOLIO_MANAGER_ROLE role can remove an environmental asset', async () => {
            portfolio = portfolio.connect(signer_A)

            await portfolio.grantRole(PORTFOLIO_MANAGER_ROLE, signer_B.address)

            const [
                environmentalAssetFactoryAddress,
                environmentalAssetAddress,
                tokenId,
            ] = await deployEnvironmentalAsset(signer_A)

            portfolio = portfolio.connect(signer_B)

            await portfolio.addEnvironmentalAssetToken(
                environmentalAssetAddress
            )

            expect(await portfolio.getTotalEnvironmentalAssetTokens()).to.equal(
                1
            )

            await expect(
                portfolio.removeEnvironmentalAssetToken(
                    environmentalAssetAddress
                )
            )
                .to.emit(portfolio, 'EnvironmentalAssetRemoved')
                .withArgs(signer_B.address, environmentalAssetAddress, 0)

            expect(await portfolio.getTotalEnvironmentalAssetTokens()).to.equal(
                0
            )
        })
    })
})
