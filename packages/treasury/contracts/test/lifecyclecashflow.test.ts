// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { AddressZero } from '@ethersproject/constants'
import { deployContract } from '../scripts/deploy'
import { deployTreasury } from '../scripts/workflows/deployTreasury'
import { HardhatProvider } from '@hashgraph/asset-tokenization-contracts/scripts'
import type { LifeCycleCashFlow } from '@contracts'

let signer_A, signer_B
let lifeCycleCashFlow: LifeCycleCashFlow
let assetAddress: string

describe('LifeCycleCashFlow operations', () => {
    before(() => {
        // mute | mock console.log
        console.log = () => {}
    })

    const hre = require('hardhat')
    const hreConfig = hre.network.config

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

        lifeCycleCashFlow = lifeCycleCashFlow.connect(signer_A)
        assetAddress = await deployContract('AssetMock', signer_A, [])
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
})
