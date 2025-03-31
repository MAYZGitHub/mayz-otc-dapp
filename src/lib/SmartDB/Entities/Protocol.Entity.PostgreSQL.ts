import { type Script } from '@lucid-evolution/lucid';
import { type CS, PostgreSQLAppliedFor} from 'smart-db';
import { BaseSmartDBEntityPostgreSQL, PostgreSQLDatabaseService } from 'smart-db/backEnd';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';
import { CampaignFactory, ProtocolEntity } from './Protocol.Entity';

@PostgreSQLAppliedFor([ProtocolEntity])
@Index(['pd_mayz_policy_id', ]) // Add indices as needed
@Entity({ name: PostgreSQLDatabaseService.getTableName(ProtocolEntity.className()) })
export class ProtocolEntityPostgreSQL extends BaseSmartDBEntityPostgreSQL {
    protected static Entity = ProtocolEntity;

    // #region fields

    @PrimaryGeneratedColumn()
    _id!: number; // Auto-generated primary key

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'integer' })
    fdpProtocolVersion!: number;

    @Column({ type: 'integer' })
    fdpScriptVersion!: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    fdpProtocolPolicyID_CS!: CS;

    @Column({ type: 'jsonb' })
    fdpProtocolPolicyID_Script!: Script;

    @Column({ type: 'jsonb' })
    fdpProtocolPolicyID_Params!: object;

    @Column({ type: 'varchar', length: 255 })
    fdpProtocolValidator_AddressMainnet!: string;

    @Column({ type: 'varchar', length: 255 })
    fdpProtocolValidator_AddressTestnet!: string;

    @Column({ type: 'jsonb' })
    fdpProtocolValidator_Script!: Script;

    @Column({ type: 'varchar', length: 255, unique: true })
    fdpProtocolValidator_Hash!: string;

    @Column({ type: 'jsonb' })
    fdpProtocolValidator_Params!: object;

    @Column({ type: 'varchar', length: 255 })
    fdpScriptPolicyID_CS!: CS;

    @Column({ type: 'jsonb' })
    fdpScriptPolicyID_Script!: Script;

    @Column({ type: 'jsonb' })
    fdpScriptPolicyID_Params!: object;

    @Column({ type: 'varchar', length: 255 })
    fdpScriptValidator_AddressMainnet!: string;

    @Column({ type: 'varchar', length: 255 })
    fdpScriptValidator_AddressTestnet!: string;

    @Column({ type: 'jsonb' })
    fdpScriptValidator_Script!: Script;

    @Column({ type: 'varchar', length: 255 })
    fdpScriptValidator_Hash!: string;

    @Column({ type: 'jsonb' })
    fdpScriptValidator_Params!: object;

    @Column({ type: 'jsonb' })
    fdpCampaignFactories!: CampaignFactory[];
    @Column({ type: "varchar", length: 255  })
    pd_admins!: String[] ;
    @Column({ type: "varchar", length: 255  })
    pd_token_admin_policy_id!: string ;
    @Column({ type: "varchar", length: 255  })
    pd_mayz_policy_id!: string ;
    @Column({ type: "varchar", length: 255  })
    pd_mayz_tn!: string ;
    @Column({ type: "varchar", length: 255  })
    pd_mayz_deposit_requirement!: bigint ;
    @Column({ type: "varchar", length: 255  })
    pd_min_ada!: bigint ;

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

    // #region posgresql db

    public static PostgreSQLModel() {
        return this;
    }

    // #endregion posgresql db
}
