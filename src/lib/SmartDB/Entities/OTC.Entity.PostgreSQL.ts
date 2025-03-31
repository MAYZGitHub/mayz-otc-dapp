import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { OTCEntity } from './OTC.Entity';
import { PostgreSQLAppliedFor,type TN } from 'smart-db';
import {  BaseSmartDBEntityPostgreSQL, PostgreSQLDatabaseService } from 'smart-db/backEnd';
import { type VrfKeyHash, type PolicyId,  } from '@lucid-evolution/lucid';

@PostgreSQLAppliedFor([OTCEntity])
@Entity({ name: PostgreSQLDatabaseService.getTableName(OTCEntity.className()) })
@Index(['od_creator', 'od_token_policy_id', ]) // Add indices as needed
export class OTCEntityPostgreSQL extends  BaseSmartDBEntityPostgreSQL {
    protected static Entity = OTCEntity;

    // #region fields

    @PrimaryGeneratedColumn()
    _id!: number; // Auto-generated primary key

    @Column({ type: "varchar", length: 255  })
    od_creator!: VrfKeyHash ;
    @Column({ type: "varchar", length: 255  })
    od_token_policy_id!: PolicyId ;
    @Column({ type: "varchar", length: 255  })
    od_token_tn!: TN ;
    @Column({ type: "varchar", length: 255  })
    od_token_amount!: bigint ;
    @Column({ type: "varchar", length: 255  })
    od_otc_nft_policy_id!: PolicyId ;
    @Column({ type: "varchar", length: 255  })
    od_otc_nft_tn!: TN ;
    @Column({ type: "varchar", length: 255  })
    od_mayz_policy_id!: PolicyId ;
    @Column({ type: "varchar", length: 255  })
    od_mayz_tn!: TN ;
    @Column({ type: "varchar", length: 255  })
    od_mayz_locked!: bigint ;
    @Column({ type: "varchar", length: 255  })
    od_min_ada!: bigint ;

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

    // #region posgresql db

    public static PostgreSQLModel() {
        return this;
    }

    // #endregion posgresql db
}
