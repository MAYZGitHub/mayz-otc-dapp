import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { LocalProtocolAdminEntity } from './LocalProtocolAdmin.Entity';
import { PostgreSQLAppliedFor, getPostgreSQLTableName,type TN } from 'smart-db';
import { BaseEntityPostgreSQL  } from 'smart-db/backEnd';
import { type Address, type PolicyId,  } from 'lucid-cardano';

@PostgreSQLAppliedFor([LocalProtocolAdminEntity])
@Entity({ name: getPostgreSQLTableName(LocalProtocolAdminEntity.className()) })

export class LocalProtocolAdminEntityPostgreSQL extends BaseEntityPostgreSQL  {
    protected static Entity = LocalProtocolAdminEntity;

    // #region fields

    @PrimaryGeneratedColumn()
    _id!: number; // Auto-generated primary key

    @Column({ type: "varchar", length: 255  })
    pp_protocol_address!: Address ;
    @Column({ type: "varchar", length: 255  })
    pp_protocol_id_tn!: TN ;
    @Column({ type: "varchar", length: 255  })
    pp_protocol_policy_id!: PolicyId ;
    @Column({ type: "varchar", length: 255  })
    pp_protocol_script_hash!:string;

    // #endregion fields

    // #region internal class methods

    public getPostgreSQLStatic(): typeof LocalProtocolAdminEntityPostgreSQL {
        return this.constructor as typeof LocalProtocolAdminEntityPostgreSQL;
    }

    public static getPostgreSQLStatic(): typeof LocalProtocolAdminEntityPostgreSQL {
        return this as typeof LocalProtocolAdminEntityPostgreSQL;
    }

    public getStatic(): typeof LocalProtocolAdminEntity {
        return LocalProtocolAdminEntityPostgreSQL.getPostgreSQLStatic().getStatic() as typeof LocalProtocolAdminEntity;
    }

    public static getStatic(): typeof LocalProtocolAdminEntity {
        return this.Entity as typeof LocalProtocolAdminEntity;
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
