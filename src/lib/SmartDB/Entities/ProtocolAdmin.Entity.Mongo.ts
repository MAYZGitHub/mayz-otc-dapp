
import { Schema, model, models } from 'mongoose';
import 'reflect-metadata';
import { MongoAppliedFor , type TN } from 'smart-db';
import {  BaseSmartDBEntityMongo, IBaseSmartDBEntity } from 'smart-db/backEnd';
import { ProtocolAdminEntity } from './ProtocolAdmin.Entity';
import { VrfKeyHash, PolicyId,  } from 'lucid-cardano';

@MongoAppliedFor([ProtocolAdminEntity])
export class ProtocolAdminEntityMongo extends  BaseSmartDBEntityMongo {
    protected static Entity = ProtocolAdminEntity;
    protected static _mongoTableName: string = ProtocolAdminEntity.className();

    // #region fields

    // pd_admins: VrfKeyHash[] 
    // pd_token_admin_policy_id: PolicyId 
    // pd_mayz_policy_id: PolicyId 
    // pd_mayz_tn: TN 
    // pd_mayz_deposit_requirement: bigint 
    // pd_min_ada: bigint 

    // #endregion fields

    // #region internal class methods

    public getMongoStatic(): typeof ProtocolAdminEntityMongo {
        return this.constructor as typeof ProtocolAdminEntityMongo;
    }

    public static getMongoStatic(): typeof ProtocolAdminEntityMongo {
        return this as typeof ProtocolAdminEntityMongo;
    }

    public getStatic(): typeof ProtocolAdminEntity {
        return this.getMongoStatic().getStatic() as typeof ProtocolAdminEntity;
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

    // #region mongo db

    public static MongoModel() {
        interface Interface {
            pd_admins:  VrfKeyHash[] ;
            pd_token_admin_policy_id:  PolicyId ;
            pd_mayz_policy_id:  PolicyId ;
            pd_mayz_tn:  TN ;
            pd_mayz_deposit_requirement:  bigint ;
            pd_min_ada:  bigint ;
        }

        const schema = new Schema<Interface>({
            pd_admins: { type: [String], required: true },
            pd_token_admin_policy_id: { type: String, required: true },
            pd_mayz_policy_id: { type: String, required: true },
            pd_mayz_tn: { type: String, required: true },
            pd_mayz_deposit_requirement: { type: String, required: true },
            pd_min_ada: { type: String, required: true },
        });

        const ModelDB = models[this._mongoTableName] || model<Interface>(this._mongoTableName, schema);
        return ModelDB;
    }

    // #endregion mongo db
}

