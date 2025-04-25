import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OTCEntity } from './OTC.Entity';
import { type PaymentPubKey, PostgreSQLAppliedFor, type TN } from 'smart-db';
import { BaseSmartDBEntityPostgreSQL, PostgreSQLDatabaseService } from 'smart-db/backEnd';
import { type PolicyId } from '@lucid-evolution/lucid';

@PostgreSQLAppliedFor([OTCEntity])
@Entity({ name: PostgreSQLDatabaseService.getTableName(OTCEntity.className()) })
@Index(['od_creator', 'od_token_policy_id']) // Add indices as needed
export class OTCEntityPostgreSQL extends BaseSmartDBEntityPostgreSQL {
    protected static Entity = OTCEntity;

    // #region fields

    @PrimaryGeneratedColumn()
    _id!: number; // Auto-generated primary key

    @Column({ type: 'varchar', length: 255, nullable: true })
    od_creator!: PaymentPubKey;
    @Column({ type: 'varchar', length: 255, nullable: true })
    od_token_policy_id!: PolicyId;
    @Column({ type: 'varchar', length: 255, nullable: true })
    od_token_tn!: TN;
    @Column({ type: 'bigint', nullable: true })
    od_token_amount!: bigint;
    @Column({ type: 'varchar', length: 255, nullable: true })
    od_otc_nft_policy_id!: PolicyId;
    @Column({ type: 'varchar', length: 255, nullable: true })
    od_otc_nft_tn!: TN;
    @Column({ type: 'varchar', length: 255, nullable: true })
    od_mayz_policy_id!: PolicyId;
    @Column({ type: 'varchar', length: 255, nullable: true })
    od_mayz_tn!: TN;
    @Column({ type: 'bigint', nullable: true })
    od_mayz_locked!: bigint;
    @Column({ type: 'bigint', nullable: true })
    od_min_ada!: bigint;

    @CreateDateColumn()
    createdAt!: Date;
    @UpdateDateColumn()
    updatedAt!: Date;

    // #endregion fields

    // #region internal class methods

    public getPostgreSQLStatic(): typeof OTCEntityPostgreSQL {
        return this.constructor as typeof OTCEntityPostgreSQL;
    }

    public static getPostgreSQLStatic(): typeof OTCEntityPostgreSQL {
        return this as typeof OTCEntityPostgreSQL;
    }

    public getStatic(): typeof OTCEntity {
        return OTCEntityPostgreSQL.getPostgreSQLStatic().getStatic() as typeof OTCEntity;
    }

    public static getStatic(): typeof OTCEntity {
        return this.Entity as typeof OTCEntity;
    }

    public className(): string {
        return this.getStatic().className();
    }

    public static className(): string {
        return this.getStatic().className();
    }

    // #endregion internal class methods
}
