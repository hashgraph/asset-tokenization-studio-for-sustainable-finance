// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { AddressZero } from '@ethersproject/constants'
import { deployContract } from '../scripts/deploy'
import { deployTreasury } from '../scripts/workflows/deployTreasury'
import { HardhatProvider } from '@hashgraph/asset-tokenization-contracts/scripts'
import type { LifeCycleCashFlow, IPause, IAccessControl } from '@contracts'
import { PAUSER_ROLE } from '../scripts/constants'

describe('LifeCycleCashFlow operations', () => {
    let signer_A, signer_B
    let lifeCycleCashFlow: LifeCycleCashFlow
    let accessControl: IAccessControl
    let pause: IPause
    let assetAddress: string

    beforeEach(async () => {
        ;[signer_A, signer_B] = await ethers.getSigners()
        const provider = new HardhatProvider()
        const deployment = await deployTreasury(provider, 'hardhat', {
            useTimeTravel: false,
            saveOutput: false, // Don't save deployment files during tests
        })

        lifeCycleCashFlow = (await ethers.getContractAt(
            'LifeCycleCashFlow',
            deployment.infrastructure.treasury.proxy
        )) as LifeCycleCashFlow

        pause = (await ethers.getContractAt(
            'IPause',
            deployment.infrastructure.treasury.proxy
        )) as IPause

        accessControl = (await ethers.getContractAt(
            'IAccessControl',
            deployment.infrastructure.treasury.proxy
        )) as IAccessControl

        assetAddress = await deployContract('AssetMock', signer_A, [])

        lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_A)
        await lifeCycleCashFlow.initialize_LifeCycleCashFlow(assetAddress)
    })

    describe('initialize_LifeCycleCashFlow', () => {
        it('GIVEN a LifeCycleCashFlow facet already initialized, WHEN trying to initialize again, THEN it reverts with AlreadyInitialized error', async () => {
            await expect(
                lifeCycleCashFlow.initialize_LifeCycleCashFlow(assetAddress)
            ).to.be.revertedWithCustomError(
                lifeCycleCashFlow,
                'AlreadyInitialized'
            )
        })

        it('GIVEN a LifeCycleCashFlow facet, WHEN passing a zero address asset, THEN it reverts with InvalidAddressZero error', async () => {
            await expect(
                lifeCycleCashFlow.initialize_LifeCycleCashFlow(AddressZero)
            ).to.be.revertedWithCustomError(
                lifeCycleCashFlow,
                'InvalidAddressZero'
            )
        })
    })

    describe('executeDistribution', () => {
        it('GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution with the contract paused, THEN it reverts with TokenIsPaused error', async () => {
            await accessControl.grantRole(PAUSER_ROLE, signer_A.address)
            await pause.pause()

            await expect(
                lifeCycleCashFlow.executeDistribution(AddressZero, 1, 1, 1)
            ).to.be.revertedWithCustomError(lifeCycleCashFlow, 'TokenIsPaused')
        })
    })

    /*describe('executeDistribution', () => {
        it('GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution with the contract paused, THEN it reverts with TokenIsPaused error', async () => {
            treasury = treasury.connect(signer_A)

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
            treasury = treasury.connect(signer_A)

            await treasury.revokeRole(PAYOUT_ROLE, signer_A.address)

            await expect(treasury.executeDistribution(AddressZero, 1, 1, 1))
                .to.be.revertedWithCustomError(treasury, 'AccountHasNoRole')
                .withArgs(signer_A.address, PAYOUT_ROLE)
        })

        it('GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution of an address zero address, THEN it reverts with InvalidAddressZero error', async () => {
            treasury = treasury.connect(signer_A)
            await expect(
                treasury.executeDistribution(AddressZero, 1, 1, 1)
            ).to.be.revertedWithCustomError(treasury, 'InvalidAddressZero')
        })

        it('GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution of a random asset, THEN it reverts with InvalidAddressZero error', async () => {
            treasury = treasury.connect(signer_A)

            const randomWallet = ethers.Wallet.createRandom();
            const privateKey = randomWallet.privateKey;

            await expect(
                treasury.executeDistribution(randomWallet.address, 1, 1, 1)
            ).to.be.revertedWithCustomError(treasury, 'InvalidAsset')
        })

        it('GIVEN an initialized LifeCycleCashFlow facet, WHEN executing a distribution on a non-distribution date, THEN it reverts with NotPaymentDate error', async () => {
            treasury = treasury.connect(signer_A)

            await expect(
                treasury.executeDistribution(assetAddress, 1, 1, 1)
            ).to.be.revertedWithCustomError(treasury, 'NotPaymentDate')
        })
    })*/
})
