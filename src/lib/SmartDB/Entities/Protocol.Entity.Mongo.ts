import { Schema, model, models } from 'mongoose';
import 'reflect-metadata';
import { MongoAppliedFor } from 'smart-db';
import { BaseSmartDBEntityMongo, IBaseSmartDBEntity } from 'smart-db/backEnd';
import { ProtocolDatum, ProtocolEntity } from './Protocol.Entity';

@MongoAppliedFor([ProtocolEntity])
export class ProtocolEntityMongo extends BaseSmartDBEntityMongo {
    protected static Entity = ProtocolEntity;
    protected static _mongoTableName: string = ProtocolEntity.className();

    // #region fields

    // #endregion fields

    // #region internal class methods

    public getMongoStatic(): typeof ProtocolEntityMongo {
        return this.constructor as typeof ProtocolEntityMongo;
    }

    public static getMongoStatic(): typeof ProtocolEntityMongo {
        return this as typeof ProtocolEntityMongo;
    }

    public getStatic(): typeof ProtocolEntity {
        return this.getMongoStatic().getStatic() as typeof ProtocolEntity;
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

    // #region mongo db

    public static DBModel() {
        interface InterfaceDB extends IBaseSmartDBEntity {
            name: string;

            fProtocolScript: { [key: string]: any };
            fProtocolScript_Params: { [key: string]: any };
            fProtocolPolicyID_CS: string;
            fProtocolValidator_AddressMainnet: string;
            fProtocolValidator_AddressTestnet: string;
            fProtocolValidator_Hash: string;

            fOTCScript: { [key: string]: any };
            fOTCScript_Params: { [key: string]: any };
            fOTCPolicyID_CS: string;
            fOTCValidator_AddressMainnet: string;
            fOTCValidator_AddressTestnet: string;
            fOTCValidator_Hash: string;

            fOTC_NFT_PRE_Script: { [key: string]: any };

            createdAt: Date;
            updatedAt: Date;
        }

        interface Interface extends InterfaceDB, ProtocolDatum {}

        //TODO: Esto es obligatorio así con SmartDB Entities
        const schemaDB = {
            ...BaseSmartDBEntityMongo.smartDBSchema,
            name: { type: String, required: true },

            fProtocolScript: { type: Object, required: true },
            fProtocolPolicyID_CS: { type: String, required: true },
            fProtocolScript_Params: { type: Object, required: true },
            fProtocolValidator_AddressMainnet: { type: String, required: true },
            fProtocolValidator_AddressTestnet: { type: String, required: true },
            fProtocolValidator_Hash: { type: String, required: true },

            fOTCScript: { type: Object, required: true },
            fOTCPolicyID_CS: { type: String, required: true },
            fOTCScript_Params: { type: Object, required: true },
            fOTCValidator_AddressMainnet: { type: String, required: true },
            fOTCValidator_AddressTestnet: { type: String, required: true },
            fOTCValidator_Hash: { type: String, required: true },

            fOTC_NFT_PRE_Script: { type: Object, required: true },
        };
        const schemaDatum = {
            pd_admins: { type: [String], required: true },
            pd_token_admin_policy_id: { type: String, required: true },
            pd_mayz_policy_id: { type: String, required: true },
            pd_mayz_tn: { type: String, required: true },
            pd_mayz_deposit_requirement: { type: String, required: true },
            pd_min_ada: { type: String, required: true },
        }

        const schema = new Schema<Interface>(
            {
                ...schemaDB,
                ...schemaDatum,
            },
            {
                timestamps: true,
            });

        const ModelDB = models[this._mongoTableName] || model<Interface>(this._mongoTableName, schema);
        return ModelDB;
    }

    // #endregion mongo db
}

