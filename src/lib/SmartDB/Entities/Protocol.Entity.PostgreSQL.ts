import { type Script } from '@lucid-evolution/lucid';
import { type CS, PostgreSQLAppliedFor } from 'smart-db';
import { BaseSmartDBEntityPostgreSQL, PostgreSQLDatabaseService } from 'smart-db/backEnd';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';
import { ProtocolEntity } from './Protocol.Entity';

@PostgreSQLAppliedFor([ProtocolEntity])
@Index(['pd_mayz_policy_id']) // Add indices as needed
@Entity({ name: PostgreSQLDatabaseService.getTableName(ProtocolEntity.className()) })
export class ProtocolEntityPostgreSQL extends BaseSmartDBEntityPostgreSQL {
    protected static Entity = ProtocolEntity;

    // #region fields

    @PrimaryGeneratedColumn()
    _id!: number; // Auto-generated primary key

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'jsonb' })
    fProtocolScript!: Script;

    @Column({ type: 'jsonb' })
    fProtocolScript_Params!: object;


    @Column({ type: 'varchar', length: 255, unique: true })
    fProtocolPolicyID_CS!: CS;
    
    @Column({ type: 'varchar', length: 255 })
    fProtocolValidator_AddressMainnet!: string;

    @Column({ type: 'varchar', length: 255 })
    fProtocolValidator_AddressTestnet!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    fProtocolValidator_Hash!: string;


    @Column({ type: 'jsonb' })
    fOTCScript!: Script;

    @Column({ type: 'jsonb' })
    fOTCScript_Params!: object;

    @Column({ type: 'varchar', length: 255 })
    fOTCPolicyID_CS!: CS;

    @Column({ type: 'varchar', length: 255 })
    fOTCValidator_AddressMainnet!: string;

    @Column({ type: 'varchar', length: 255 })
    fOTCValidator_AddressTestnet!: string;

    @Column({ type: 'varchar', length: 255 })
    fOTCValidator_Hash!: string;

    @Column({ type: 'jsonb' })
    fOTC_NFT_PRE_Script!: object;

    @CreateDateColumn()
    createdAt!: Date;
    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: 'varchar', length: 255, array: true, nullable: true })
    pd_admins!: String[];
    @Column({ type: 'varchar', length: 255, nullable: true })
    pd_token_admin_policy_id!: string;
    @Column({ type: 'varchar', length: 255, nullable: true })
    pd_mayz_policy_id!: string;
    @Column({ type: 'varchar', length: 255, nullable: true })
    pd_mayz_tn!: string;
    @Column({ type: 'bigint', nullable: true })
    pd_mayz_deposit_requirement!: bigint;
    @Column({ type: 'bigint', nullable: true })
    pd_min_ada!: bigint;

    // #endregion fields

    // #region internal class methods

    public getPostgreSQLStatic(): typeof ProtocolEntityPostgreSQL {
        return this.constructor as typeof ProtocolEntityPostgreSQL;
    }

    public static getPostgreSQLStatic(): typeof ProtocolEntityPostgreSQL {
        return this as typeof ProtocolEntityPostgreSQL;
    }

    public getStatic(): typeof ProtocolEntity {
        return ProtocolEntityPostgreSQL.getPostgreSQLStatic().getStatic() as typeof ProtocolEntity;
    }

    public static getStatic(): typeof ProtocolEntity {
        return this.Entity as typeof ProtocolEntity;
    }

    public className(): string {
        return this.getStatic().className();
    }

    public static className(): string {
        return this.getStatic().className();
    }

    // #endregion internal class methods

}
