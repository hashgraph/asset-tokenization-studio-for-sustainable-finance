import { BaseEntityPersistence } from '@hashgraph/green-bonds-shared-core'
import { Entity, Column } from 'typeorm'

@Entity('Bonds')
export class BondPersistence extends BaseEntityPersistence {
  @Column({ type: 'varchar', length: 255, unique: true })
  contractId: string

  @Column({ type: 'varchar', length: 255, unique: true })
  treasuryId: string

  @Column({ type: 'varchar', length: 255, unique: true })
  kpiId: string

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'varchar', length: 50 })
  symbol: string

  @Column({ type: 'varchar', length: 50 })
  isin: string

  @Column({ type: 'int' })
  decimals: number

  @Column({ type: 'varchar', length: 50 })
  currency: string

  @Column({ type: 'numeric', precision: 78, scale: 0 })
  nominalValue: string

  @Column({ type: 'timestamp' })
  startingDate: Date

  @Column({ type: 'timestamp' })
  maturityDate: Date

  @Column({ type: 'numeric', precision: 78, scale: 0 })
  maxSupply: string
}
