
import { Schema, model, models } from 'mongoose';
import 'reflect-metadata';
import { MongoAppliedFor ,type TN } from 'smart-db';
import { BaseEntityMongo  } from 'smart-db/backEnd';
import { LocalProtocolAdminEntity } from './LocalProtocolAdmin.Entity';
import { type Address,type PolicyId,  } from 'lucid-cardano';

@MongoAppliedFor([LocalProtocolAdminEntity])
export class LocalProtocolAdminEntityMongo extends BaseEntityMongo  {
    protected static Entity = LocalProtocolAdminEntity;
    protected static _mongoTableName: string = LocalProtocolAdminEntity.className();

    // #region fields

    // pp_protocol_address: Address 
    // pp_protocol_id_tn: TN 
    // pp_protocol_policy_id: PolicyId 
    // pp_protocol_script_hash:String

    // #endregion fields

    // #region internal class methods

    public getMongoStatic(): typeof LocalProtocolAdminEntityMongo {
        return this.constructor as typeof LocalProtocolAdminEntityMongo;
    }

    public static getMongoStatic(): typeof LocalProtocolAdminEntityMongo {
        return this as typeof LocalProtocolAdminEntityMongo;
    }

    public getStatic(): typeof LocalProtocolAdminEntity {
        return this.getMongoStatic().getStatic() as typeof LocalProtocolAdminEntity;
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

    // #region mongo db

    public static MongoModel() {
        interface Interface {
            pp_protocol_address:  Address ;
            pp_protocol_id_tn:  TN ;
            pp_protocol_policy_id:  PolicyId ;
            pp_protocol_script_hash: string;
        }

        const schema = new Schema<Interface>({
            pp_protocol_address: { type: String, required: true },
            pp_protocol_id_tn: { type: String, required: true },
            pp_protocol_policy_id: { type: String, required: true },
            pp_protocol_script_hash: { type: String, required: true },
        });

        const ModelDB = models[this._mongoTableName] || model<Interface>(this._mongoTableName, schema);
        return ModelDB;
    }

    // #endregion mongo db
}

