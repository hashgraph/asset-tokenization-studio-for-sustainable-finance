// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { AddressZero } from '@ethersproject/constants'
import { type ProceedsManagementFacet } from '@typechain'
import { FUNDS_MANAGER_ROLE } from '../scripts/constants'
import { deployContract } from '../scripts/deploy.ts'

let signer_A, signer_B
let proceedsManagement: ProceedsManagementFacet

describe('Proceeds management operations', () => {
    /*before(() => {
        // mute | mock console.log
        console.log = () => {}
    })*/

    const hre = require('hardhat')
    const hreConfig = hre.network.config

    beforeEach(async () => {
        ;[signer_A, signer_B] = await ethers.getSigners()
        const proceedsManagementAddress = await deployContract(
            'ProceedsManagementFacet',
            signer_A,
            []
        )

        proceedsManagement = await ethers.getContractAt(
            'ProceedsManagementFacet',
            proceedsManagementAddress
        )
        proceedsManagement = proceedsManagement.connect(signer_A)
        await proceedsManagement.initialize_ProceedsManagement()
    })

    describe('fundProceedsRecipient', () => {
        it('An account cannot fund a proceeds recipient if the contract is paused', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await proceedsManagement.pause({gasLimit: 2000000})

            await expect(
                proceedsManagement.fundProceedsRecipient(AddressZero, 1)
            ).to.be.revertedWithCustomError(proceedsManagement, 'TokenIsPaused')
        })

        it('An account not granted the FUNDS_MANAGER_ROLE role cannot fund a proceeds management', async () => {
            proceedsManagement = proceedsManagement.connect(signer_B)

            await expect(
                proceedsManagement.fundProceedsRecipient(AddressZero, 1)
            ).to.be.revertedWithCustomError(proceedsManagement, 'AccountHasNoRole')
        })

        it.only('An account with the FUNDS_MANAGER_ROLE role revoked cannot fund a proceeds recipient', async () => {
console.log("0")
            proceedsManagement = proceedsManagement.connect(signer_A)
console.log("1")
            await proceedsManagement.revokeRole(FUNDS_MANAGER_ROLE, signer_A.address)
console.log("2")
            await expect(
                proceedsManagement.fundProceedsRecipient(AddressZero, 1)
            ).to.be.revertedWithCustomError(proceedsManagement, 'AccountHasNoRole')
        })
    })
})
