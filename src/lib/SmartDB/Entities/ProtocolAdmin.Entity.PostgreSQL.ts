import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ProtocolAdminEntity } from './ProtocolAdmin.Entity';
import { PostgreSQLAppliedFor, getPostgreSQLTableName, type TN } from 'smart-db';
import {  BaseSmartDBEntityPostgreSQL } from 'smart-db/backEnd';
import { type VrfKeyHash, type PolicyId,  } from 'lucid-cardano';

@PostgreSQLAppliedFor([ProtocolAdminEntity])
@Entity({ name: getPostgreSQLTableName(ProtocolAdminEntity.className()) })
@Index(['pd_mayz_policy_id', ]) // Add indices as needed
export class ProtocolAdminEntityPostgreSQL extends  BaseSmartDBEntityPostgreSQL {
    protected static Entity = ProtocolAdminEntity;

    // #region fields

    @PrimaryGeneratedColumn()
    _id!: number; // Auto-generated primary key

    @Column({ type: "varchar", length: 255  })
    pd_admins!: VrfKeyHash[] ;
    @Column({ type: "varchar", length: 255  })
    pd_token_admin_policy_id!: PolicyId ;
    @Column({ type: "varchar", length: 255  })
    pd_mayz_policy_id!: PolicyId ;
    @Column({ type: "varchar", length: 255  })
    pd_mayz_tn!: TN ;
    @Column({ type: "varchar", length: 255  })
    pd_mayz_deposit_requirement!: bigint ;
    @Column({ type: "varchar", length: 255  })
    pd_min_ada!: bigint ;

    // #endregion fields

    // #region internal class methods

    public getPostgreSQLStatic(): typeof ProtocolAdminEntityPostgreSQL {
        return this.constructor as typeof ProtocolAdminEntityPostgreSQL;
    }

    public static getPostgreSQLStatic(): typeof ProtocolAdminEntityPostgreSQL {
        return this as typeof ProtocolAdminEntityPostgreSQL;
    }

    public getStatic(): typeof ProtocolAdminEntity {
        return ProtocolAdminEntityPostgreSQL.getPostgreSQLStatic().getStatic() as typeof ProtocolAdminEntity;
    }

    public static getStatic(): typeof ProtocolAdminEntity {
        return this.Entity as typeof ProtocolAdminEntity;
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
