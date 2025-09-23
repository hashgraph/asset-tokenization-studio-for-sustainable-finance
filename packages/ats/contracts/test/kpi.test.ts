import { KPI } from '@contracts/contracts'
import { ProxyAdmin } from '@contracts/index'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployKPI, upgradeKPIProxy } from '@scripts/deploy/kpiDeploy'
import { deployProxyAdmin } from '@scripts/proxy/deployProxy'
import { getImplementationAddress } from '@scripts/utils'
import { expect } from 'chai'
import { Signer } from 'ethers'
import { ethers } from 'hardhat'

describe('KPI', () => {
    let kpi: KPI
    let proxyAdmin: ProxyAdmin
    let unknownSigner: Signer

    async function deployFixture() {
        proxyAdmin = await deployProxyAdmin()

        kpi = (await deployKPI(proxyAdmin)).kpi
    }
    before(async () => {
        const signers = await ethers.getSigners()
        unknownSigner = signers[signers.length - 1]
    })
    beforeEach(async () => {
        await loadFixture(deployFixture)
    })

    describe('initialize', () => {
        it('cant initialize twice', async () => {
            await expect(kpi.initialize()).to.be.revertedWith(
                'Initializable: contract is already initialized'
            )
        })
    })

    describe('addKPIData', () => {
        it('successfully adds KPI data emit KPIDataAdded', async () => {
            await expect(kpi.addKPIData(1, 100))
                .to.emit(kpi, 'KPIDataAdded')
                .withArgs(1, 100)
        })
        it('reverts with InvalidDate if date is 0', async () => {
            await expect(kpi.addKPIData(0, 100)).to.be.revertedWithCustomError(
                kpi,
                'InvalidDate'
            )
        })

        it('reverts with InvalidKPIValue if value is 0', async () => {
            await expect(kpi.addKPIData(1, 0)).to.be.revertedWithCustomError(
                kpi,
                'InvalidKPIValue'
            )
        })
        it('reverts if not owner', async () => {
            await expect(
                kpi.connect(unknownSigner).addKPIData(1, 100)
            ).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('reverts if paused', async () => {
            await kpi.pause()
            await expect(kpi.addKPIData(1, 100)).to.be.revertedWith(
                'Pausable: paused'
            )
        })

        it('allows after unpause', async () => {
            await kpi.pause()
            await kpi.unpause()
            await expect(kpi.addKPIData(2, 200))
                .to.emit(kpi, 'KPIDataAdded')
                .withArgs(2, 200)
        })
    })
    describe('pause/unpause', () => {
        it('only owner can pause', async () => {
            await expect(kpi.connect(unknownSigner).pause()).to.be.revertedWith(
                'Ownable: caller is not the owner'
            )
            await expect(kpi.pause()).to.emit(kpi, 'Paused')
        })

        it('only owner can unpause', async () => {
            await kpi.pause()
            await expect(
                kpi.connect(unknownSigner).unpause()
            ).to.be.revertedWith('Ownable: caller is not the owner')
            await expect(kpi.unpause()).to.emit(kpi, 'Unpaused')
        })

        it('pause disables addKPIData', async () => {
            await kpi.pause()
            await expect(kpi.addKPIData(1, 100)).to.be.revertedWith(
                'Pausable: paused'
            )
        })

        it('unpause enables addKPIData', async () => {
            await kpi.pause()
            await kpi.unpause()
            await expect(kpi.addKPIData(1, 100)).to.emit(kpi, 'KPIDataAdded')
        })
    })
    describe('getKPIData', () => {
        async function addTestData() {
            await kpi.addKPIData(10, 100)
            await kpi.addKPIData(20, 200)
            await kpi.addKPIData(30, 300)
        }

        it('returns the aggregated value in range', async () => {
            await addTestData()
            const agg = await kpi.getKPIData(10, 30)
            expect(agg.kpiAggregatedValue_).to.equal(600)
        })

        it('returns 0 if no data in range', async () => {
            await addTestData()
            const agg = await kpi.getKPIData(40, 50)
            expect(agg.kpiAggregatedValue_).to.equal(0)
        })
        it('returns 0 if there are no KPI records', async () => {
            const agg = await kpi.getKPIData(1, 100)
            expect(agg.kpiAggregatedValue_).to.equal(0)
        })

        it('returns the aggregated value in range when the toDate is not the last', async () => {
            await addTestData()
            const agg = await kpi.getKPIData(10, 20)
            expect(agg.kpiAggregatedValue_).to.equal(300)
        })

        it('reverts with InvalidDate if fromDate is 0', async () => {
            await expect(kpi.getKPIData(0, 30)).to.be.revertedWithCustomError(
                kpi,
                'InvalidDate'
            )
        })

        it('reverts with InvalidDate if toDate is 0', async () => {
            await expect(kpi.getKPIData(10, 0)).to.be.revertedWithCustomError(
                kpi,
                'InvalidDate'
            )
        })

        it('reverts with InvalidDateRange if fromDate > toDate', async () => {
            await expect(kpi.getKPIData(30, 10)).to.be.revertedWithCustomError(
                kpi,
                'InvalidDateRange'
            )
        })
    })

    describe('upgradability', () => {
        it('upgrades the implementation and preserves storage', async () => {
            await kpi.addKPIData(1, 123)
            const before = await kpi.getKPIData(1, 1)
            expect(before.kpiAggregatedValue_).to.equal(123)
            const originalImplementationAddress =
                await getImplementationAddress(kpi.address)

            await upgradeKPIProxy(proxyAdmin, kpi.address)

            const newImplementationAddress = await getImplementationAddress(
                kpi.address
            )

            expect(newImplementationAddress).to.not.equal(
                originalImplementationAddress
            )

            const after = await kpi.getKPIData(1, 1)
            expect(after.kpiAggregatedValue_).to.equal(123)

            await kpi.addKPIData(2, 200)
            const agg = await kpi.getKPIData(1, 2)
            expect(agg.kpiAggregatedValue_).to.equal(323)
        })
    })
})
