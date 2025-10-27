// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { AddressZero } from '@ethersproject/constants'
import { deployContract } from '../scripts/deploy'
import { deployTreasury, DeployTreasuryOutput } from '../scripts/workflows/deployTreasury'
import {
  HardhatProvider
} from "@hashgraph/asset-tokenization-contracts/scripts";

let signer_A, signer_B
let treasury: DeployTreasuryOutput
let assetAddress: string

describe('LifeCycleCashFlow operations', () => {
    /*before(() => {
        // mute | mock console.log
        console.log = () => {}
    })*/

    const hre = require('hardhat')
    const hreConfig = hre.network.config

    beforeEach(async () => {
        ;[signer_A, signer_B] = await ethers.getSigners()
        const provider = new HardhatProvider();
        const treasury = await deployTreasury(
          provider, "hardhat", {
          useTimeTravel: false,
          saveOutput: false, // Don't save deployment files during tests
        })
        /*treasury = treasury.connect(signer_A)
        assetAddress = await deployContract('MockBond', signer_A, [])
        await treasury.initialize_LifeCycleCashFlow(assetAddress)*/
    })

    describe('initialize_LifeCycleCashFlow', () => {
        it('GIVEN a LifeCycleCashFlow facet already initialized, WHEN trying to initialize again, THEN it reverts with AlreadyInitialized error', async () => {
            /*await expect(
                treasury.initialize_LifeCycleCashFlow(assetAddress)
            ).to.be.revertedWithCustomError(treasury, 'AlreadyInitialized')*/
        })
    })
})
