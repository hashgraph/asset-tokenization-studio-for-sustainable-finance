// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { AddressZero } from '@ethersproject/constants'
import { type PortfolioFacet, type ProceedsManagementFacet } from '@typechain'
import { FUNDS_MANAGER_ROLE, PROCEEDS_FULL_MANAGER } from '../scripts/constants'
import { deployContract, deployPaymentToken, deployEnvironmentalAsset } from '../scripts/deploy.ts'

let signer_A, signer_B
let portfolio: PortfolioFacet
let proceedsManagement: ProceedsManagementFacet
let environmentalAssetAddress: string
let tokenId: number

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

    describe('transferPaymentToken', () => {
        it('An account cannot transfer payment token if the contract is paused', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await proceedsManagement.pause()

            await expect(
                proceedsManagement.transferPaymentToken(AddressZero, 1)
            ).to.be.revertedWithCustomError(proceedsManagement, 'TokenIsPaused')
        })

        it('An account not granted the PROCEEDS_FULL_MANAGER role cannot transfer payment token', async () => {
            proceedsManagement = proceedsManagement.connect(signer_B)

            await expect(
                proceedsManagement.transferPaymentToken(AddressZero, 1)
            ).to.be.revertedWithCustomError(
                proceedsManagement,
                'AccountHasNoRole'
            )
        })

        it('An account with the PROCEEDS_FULL_MANAGER role revoked cannot transfer payment token', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await proceedsManagement.revokeRole(
                PROCEEDS_FULL_MANAGER,
                signer_A.address
            )

            await expect(
                proceedsManagement.transferPaymentToken(AddressZero, 1)
            ).to.be.revertedWithCustomError(
                proceedsManagement,
                'AccountHasNoRole'
            )
        })

        beforeEach(async () => {
            const [paymentTokenFactoryAddress, paymentTokenAddress] =
                await deployPaymentToken(signer_A, 100, 2)
            const portfolioAddress = await deployContract(
                'PortfolioFacet',
                signer_A,
                []
            )

            portfolio = await ethers.getContractAt(
                'PortfolioFacet',
                portfolioAddress
            )
            portfolio = portfolio.connect(signer_A)

            await portfolio.initialize_Portfolio(paymentTokenAddress, [])
            expect(await portfolio.getPaymentToken()).to.equal(
                paymentTokenAddress
            )

            let paymentTokenFactory = await ethers.getContractAt(
                'PaymentTokenFactory',
                paymentTokenFactoryAddress
            )
            paymentTokenFactory = paymentTokenFactory.connect(signer_A)
            await paymentTokenFactory.transferPaymentToken(
                paymentTokenAddress,
                proceedsManagement.address,
                100
            )
        })

        it.skip('An account with the PROCEEDS_FULL_MANAGER role cannot transfer more payment tokens than the Treasury owns', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)
            await expect(
                proceedsManagement.transferPaymentToken(signer_A.address, 200)
            )
                .to.be.revertedWithCustomError(
                    proceedsManagement,
                    'NotEnoughBalance'
                )
                .withArgs(100)
        })

        it.skip('An account with the PROCEEDS_FULL_MANAGER role cannot transfer payment tokens to address zero', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await expect(
                proceedsManagement.transferPaymentToken(AddressZero, 100, {
                    gasLimit: 800000,
                })
            )
                .to.be.revertedWithCustomError(
                    proceedsManagement,
                    'TransferPaymentTokenFailed'
                )
                .withArgs(AddressZero, 100)
        })

        it.skip('An account with the PROCEEDS_FULL_MANAGER role can transfer payment tokens', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await expect(
                proceedsManagement.transferPaymentToken(signer_A.address, 100, {
                    gasLimit: 800000,
                })
            )
                .to.emit(proceedsManagement, 'PaymentTokenTransferred')
                .withArgs(signer_A.address, 100)
        })
    })

    describe('transferEnvironmentalAssetToken', () => {
        it('An account cannot transfer an environmental asset token if the contract is paused', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await proceedsManagement.pause()

            await expect(
                proceedsManagement.transferEnvironmentalAssetToken(
                    AddressZero,
                    AddressZero,
                    1
                )
            ).to.be.revertedWithCustomError(proceedsManagement, 'TokenIsPaused')
        })

        it('An account not granted the PROCEEDS_FULL_MANAGER role cannot transfer an environmental asset token', async () => {
            proceedsManagement = proceedsManagement.connect(signer_B)

            await expect(
                proceedsManagement.transferEnvironmentalAssetToken(
                    AddressZero,
                    AddressZero,
                    1
                )
            ).to.be.revertedWithCustomError(
                proceedsManagement,
                'AccountHasNoRole'
            )
        })

        it('An account with the PROCEEDS_FULL_MANAGER role revoked cannot transfer an environmental asset token', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await proceedsManagement.revokeRole(
                PROCEEDS_FULL_MANAGER,
                signer_A.address
            )

            await expect(
                proceedsManagement.transferEnvironmentalAssetToken(
                    AddressZero,
                    AddressZero,
                    1
                )
            ).to.be.revertedWithCustomError(
                proceedsManagement,
                'AccountHasNoRole'
            )
        })

        beforeEach(async () => {
            const [paymentTokenFactoryAddress,
                   paymentTokenAddress] =
                await deployPaymentToken(signer_A, 100, 2)
            const [environmentalAssetFactoryAddress,
                   assetAddress,
                   sequentialNumber] =
                await deployEnvironmentalAsset(signer_A)
            environmentalAssetAddress = assetAddress
            tokenId = sequentialNumber
            const portfolioAddress = await deployContract(
                'PortfolioFacet',
                signer_A,
                []
            )
            portfolio = await ethers.getContractAt(
                'PortfolioFacet',
                portfolioAddress
            )
            portfolio = portfolio.connect(signer_A)

            await portfolio.initialize_Portfolio(paymentTokenAddress, [
                environmentalAssetAddress,
            ])


            let environmentalAssetFactory = await ethers.getContractAt(
                'EnvironmentalAssetFactory',
                environmentalAssetFactoryAddress
            )
            environmentalAssetFactory = environmentalAssetFactory.connect(signer_A)
            await environmentalAssetFactory.transferEnvironmentalAssetToken(
                environmentalAssetAddress,
                portfolio.address,
                tokenId
            )
        })

        it.skip('An account with the PROCEEDS_FULL_MANAGER role cannot transfer a tokenId that does not own', async () => {
          proceedsManagement = proceedsManagement.connect(signer_A)
          await expect(
              proceedsManagement.transferEnvironmentalAssetToken(environmentalAssetAddress, signer_A.address, 346346)
          )
              .to.be.revertedWithCustomError(
                  proceedsManagement,
                  'NotTokenIdOwner'
              )
              .withArgs(tokenId)
        })

        it.skip('An account with the PROCEEDS_FULL_MANAGER role cannot transfer an environmental asset token to address zero', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await expect(
                proceedsManagement.transferEnvironmentalAssetToken(environmentalAssetAddress, addressZero, tokenId)
            )
                .to.be.revertedWithCustomError(
                    proceedsManagement,
                    'TransferEnvironmentalAssetTokenFailed'
                )
                .withArgs(environmentalAssetAddress, AddressZero, tokenId)
        })

        it.skip('An account with the PROCEEDS_FULL_MANAGER role can transfer an environmental asset token', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await expect(
                proceedsManagement.transferPaymentToken(environmentalAssetAddress, signer_A.address, tokenId)
            )
                .to.emit(proceedsManagement, 'EnvironmentalAssetTokenTransferred')
                .withArgs(environmentalAssetAddress, signer_A.address, tokenId)
        })
    })

    describe('fundProceedsRecipient', () => {
        it('An account cannot fund a proceeds recipient if the contract is paused', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await proceedsManagement.pause()

            await expect(
                proceedsManagement.fundProceedsRecipient(AddressZero, 1)
            ).to.be.revertedWithCustomError(proceedsManagement, 'TokenIsPaused')
        })

        it('An account not granted the FUNDS_MANAGER_ROLE role cannot fund a proceeds management', async () => {
            proceedsManagement = proceedsManagement.connect(signer_B)

            await expect(
                proceedsManagement.fundProceedsRecipient(AddressZero, 1)
            ).to.be.revertedWithCustomError(
                proceedsManagement,
                'AccountHasNoRole'
            )
        })

        it('An account with the FUNDS_MANAGER_ROLE role revoked cannot fund a proceeds recipient', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await proceedsManagement.revokeRole(
                FUNDS_MANAGER_ROLE,
                signer_A.address
            )

            await expect(
                proceedsManagement.fundProceedsRecipient(AddressZero, 1)
            ).to.be.revertedWithCustomError(
                proceedsManagement,
                'AccountHasNoRole'
            )
        })

        it.skip('An account with the PROCEEDS_FULL_MANAGER role cannot fund a proceeds recipient if this does not belong to the bond', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)
            const proceedsRecipient = signer_A.address

            await expect(
                proceedsManagement.fundProceedsRecipient(proceedsRecipient, 1)
            )
                .to.be.revertedWithCustomError(
                    proceedsManagement,
                    'WrongProceedsRecipient'
                )
                .withArgs(proceedsRecipient)
        })

        beforeEach(async () => {
            const [paymentTokenFactoryAddress, paymentTokenAddress] =
                await deployPaymentToken(signer_A, 100, 2)
            const portfolioAddress = await deployContract(
                'PortfolioFacet',
                signer_A,
                []
            )

            portfolio = await ethers.getContractAt(
                'PortfolioFacet',
                portfolioAddress
            )
            portfolio = portfolio.connect(signer_A)

            await portfolio.initialize_Portfolio(paymentTokenAddress, [])
            expect(await portfolio.getPaymentToken()).to.equal(
                paymentTokenAddress
            )

            let paymentTokenFactory = await ethers.getContractAt(
                'PaymentTokenFactory',
                paymentTokenFactoryAddress
            )
            paymentTokenFactory = paymentTokenFactory.connect(signer_A)
            await paymentTokenFactory.transferPaymentToken(
                paymentTokenAddress,
                proceedsManagement.address,
                100
            )
        })

        it.skip('An account with the PROCEEDS_FULL_MANAGER role cannot fund a proceeds recipient with more payment tokens than the Treasury owns', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)
            // TODO: Change to a valid proceeds recipient belonging to the bond
            const proceedsRecipient = signer_A.address

            await expect(
                proceedsManagement.transferPaymentToken(recipient, 200)
            )
                .to.be.revertedWithCustomError(
                    proceedsManagement,
                    'NotEnoughBalance'
                )
                .withArgs(100)
        })

        it.skip('An account with the PROCEEDS_FULL_MANAGER role cannot fund a proceeds recipient with address zero', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)

            await expect(
                proceedsManagement.transferPaymentToken(AddressZero, 100, {
                    gasLimit: 800000,
                })
            )
                .to.be.revertedWithCustomError(
                    proceedsManagement,
                    'TransferPaymentTokenFailed'
                )
                .withArgs(AddressZero, 100)
        })

        it.skip('An account with the PROCEEDS_FULL_MANAGER role can fund a proceeds recipient belonging to the bond', async () => {
            proceedsManagement = proceedsManagement.connect(signer_A)
            // TODO: Change to a valid proceeds recipient belonging to the bond
            const proceedsRecipient = signer_A.address

            await expect(
                proceedsManagement.transferPaymentToken(
                    proceedsRecipient,
                    100,
                    {
                        gasLimit: 800000,
                    }
                )
            )
                .to.emit(proceedsManagement, 'PaymentTokenTransferred')
                .withArgs(proceedsRecipient, 100)
        })
    })
})
