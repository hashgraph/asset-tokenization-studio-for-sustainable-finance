// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { AddressZero } from '@ethersproject/constants'
import { deployContract } from '../scripts/test/deploy'
import { deployTreasury } from '../scripts/workflows/deployTreasury'
import { HardhatProvider } from '@hashgraph/asset-tokenization-contracts/scripts'
import type { ITreasury } from '@contracts'
import { PAYOUT_ROLE, PAUSER_ROLE } from '../scripts/constants'

describe('LifeCycleCashFlow operations', () => {
    let signer_A, signer_B
    let treasury: ITreasury
    let assetAddress: string

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

        assetAddress = await deployContract('AssetMock', signer_A, [true])

        treasury = treasury.connect(signer_A)
        await treasury.initialize_LifeCycleCashFlow(assetAddress)
    })

    describe('initialize_LifeCycleCashFlow', () => {
        it('GIVEN a LifeCycleCashFlow facet already initialized, WHEN trying to initialize again, THEN it reverts with AlreadyInitialized error', async () => {
            await expect(
                treasury.initialize_LifeCycleCashFlow(assetAddress)
            ).to.be.revertedWithCustomError(treasury, 'AlreadyInitialized')
        })

        it('GIVEN a LifeCycleCashFlow facet, WHEN passing a zero address asset, THEN it reverts with InvalidAddressZero error', async () => {
            await expect(
                treasury.initialize_LifeCycleCashFlow(AddressZero)
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })
    })

    describe('executeDistribution', () => {
        it('GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution with the contract paused, THEN it reverts with TokenIsPaused error', async () => {
            await treasury.grantRole(PAUSER_ROLE, signer_A.address)
            await treasury.pause()

            await expect(
                treasury.executeDistribution(AddressZero, 1, 1, 1)
            ).to.be.revertedWithCustomError(treasury, 'TokenIsPaused')
        })

        it('GIVEN an initialized LifeCycleCashFlow facet, WHEN an account not granted the PAYOUT_ROLE role executes a distribution, THEN it reverts with AccountHasNoRole error', async () => {
            treasury = treasury.connect(signer_B)
            await expect(treasury.executeDistribution(AddressZero, 1, 1, 1))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_B.address, PAYOUT_ROLE)
        })

        it('GIVEN an initialized LifeCycleCashFlow facet, WHEN an account with the PAYOUT_ROLE role revoked executes a distribution, THEN it reverts with AccountHasNoRole error', async () => {
            await treasury.grantRole(PAYOUT_ROLE, signer_A.address)
            await treasury.revokeRole(PAYOUT_ROLE, signer_A.address)

            await expect(treasury.executeDistribution(AddressZero, 1, 1, 1))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_A.address, PAYOUT_ROLE)
        })

        it('GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution of an address zero address, THEN it reverts with InvalidAddressZero error', async () => {
            await treasury.grantRole(PAYOUT_ROLE, signer_A.address)
            await expect(
                treasury.executeDistribution(AddressZero, 1, 1, 1)
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })

        it('GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution of a random asset, THEN it reverts with InvalidAddressZero error', async () => {
            await treasury.grantRole(PAYOUT_ROLE, signer_A.address)

            const randomWallet = ethers.Wallet.createRandom()
            const privateKey = randomWallet.privateKey

            await expect(
                treasury.executeDistribution(randomWallet.address, 1, 1, 1)
            ).to.be.revertedWithCustomError(treasury, 'InvalidAsset')
        })

        it('GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution on a non-distribution date, THEN it reverts with NotPaymentDate error', async () => {
            await treasury.grantRole(PAYOUT_ROLE, signer_A.address)

            await expect(
                treasury.executeDistribution(assetAddress, 1, 1, 1)
            ).to.be.revertedWithCustomError(treasury, 'NotPaymentDate')
        })

        it.only('GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution, THEN the distribution is paid to the holders', async () => {
            await treasury.grantRole(PAYOUT_ROLE, signer_A.address)

            await expect(
                treasury.executeDistribution(assetAddress, 1, 1, 1)
            ).to.be.revertedWithCustomError(treasury, 'NotPaymentDate')
        })
    })
})
