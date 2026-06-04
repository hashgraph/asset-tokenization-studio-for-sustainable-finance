// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondKpiDataPersistence } from "@port/kpidata/persistence/model/BondKpiDataPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { KpiDataAddedDLTEvent } from "@port/kpidata/usecase/addbondkpidata/model/KpiDataAddedDLTEvent"
import { BondKpiDataAddedEvent } from "@domain/kpidata/event/BondKpiDataAddedEvent"

describe("AddBondKpiDataNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"
  const PROJECT = "0xcdc1c3a95ec40007cf92e3db67617063a177f54c"
  const TX_HASH = "0xabc123"

  let app: INestApplication
  let eventBus: EventBus
  let bondRepository: Repository<BondPersistence>
  let kpiDataRepository: Repository<BondKpiDataPersistence>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    kpiDataRepository = app.get(getRepositoryToken(BondKpiDataPersistence))

    await bondRepository.save({
      contractId: CONTRACT_ID,
      treasuryId: "0.0.6823801",
      name: "Green Bond",
      symbol: "GBND",
      decimals: 18,
      currency: "USD",
      nominalValue: "1000",
      nominalValueDecimals: 2,
      startingDate: new Date("2025-01-01"),
      maturityDate: new Date("2030-01-01"),
      maxSupply: "1000000",
      isin: "US1234567890",
    })
  })

  afterEach(async () => {
    await kpiDataRepository.query('DELETE FROM "BondKpiData"')
    await bondRepository.query('DELETE FROM "Bonds"')
    await app.close()
  })

  describe("AddBondKpiDataNestJSEventAdapter", () => {
    it("should persist KPI data point when KpiDataAddedDLTEvent is published", async () => {
      const event = new KpiDataAddedDLTEvent(CONTRACT_ID, TX_HASH, PROJECT, "1748908800", "105")

      await eventBus.publishSync(event, KpiDataAddedDLTEvent.name)

      const records = await kpiDataRepository.find({ where: { bondContractId: CONTRACT_ID } })
      expect(records).toHaveLength(1)
      expect(records[0].bondContractId).toBe(CONTRACT_ID)
      expect(records[0].project).toBe(PROJECT)
      expect(records[0].date).toBe("1748908800")
      expect(records[0].value).toBe("105")
    })

    it("should insert multiple data points for different dates", async () => {
      const dates = ["1748908800", "1748995200", "1749081600"]

      for (const date of dates) {
        const event = new KpiDataAddedDLTEvent(CONTRACT_ID, TX_HASH, PROJECT, date, "100")
        await eventBus.publishSync(event, KpiDataAddedDLTEvent.name)
      }

      const records = await kpiDataRepository.find({ where: { bondContractId: CONTRACT_ID } })
      expect(records).toHaveLength(3)
    })

    it("should persist KPI data with different values", async () => {
      const values = ["50", "100", "150"]

      for (let i = 0; i < values.length; i++) {
        const date = String(1748908800 + i * 86400)
        const event = new KpiDataAddedDLTEvent(CONTRACT_ID, TX_HASH, PROJECT, date, values[i])
        await eventBus.publishSync(event, KpiDataAddedDLTEvent.name)
      }

      const records = await kpiDataRepository.find({
        where: { bondContractId: CONTRACT_ID },
        order: { date: "ASC" },
      })
      expect(records).toHaveLength(3)
      expect(records.map((r) => r.value)).toEqual(values)
    })

    it("should persist KPI data with large uint256 value", async () => {
      const event = new KpiDataAddedDLTEvent(CONTRACT_ID, TX_HASH, PROJECT, "1748908800", "999999999999999999")

      await eventBus.publishSync(event, KpiDataAddedDLTEvent.name)

      const saved = await kpiDataRepository.findOne({ where: { bondContractId: CONTRACT_ID } })
      expect(saved!.value).toBe("999999999999999999")
    })

    it("should publish BondKpiDataAddedEvent after persisting", async () => {
      let publishedEvent: unknown
      jest.spyOn(eventBus, "publish").mockImplementation((e) => (publishedEvent = e))

      const event = new KpiDataAddedDLTEvent(CONTRACT_ID, TX_HASH, PROJECT, "1748908800", "105")
      await eventBus.publishSync(event, KpiDataAddedDLTEvent.name)

      expect(publishedEvent).toBeInstanceOf(BondKpiDataAddedEvent)
      expect(publishedEvent).toEqual(
        expect.objectContaining({ bondContractId: CONTRACT_ID, project: PROJECT, value: "105" }),
      )
    })
  })
})
