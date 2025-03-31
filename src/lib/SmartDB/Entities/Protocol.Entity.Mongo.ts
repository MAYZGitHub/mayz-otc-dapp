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
            fdpProtocolVersion: number;
            fdpScriptVersion: number;

            fdpProtocolPolicyID_CS: string;
            fdpProtocolPolicyID_Script: { [key: string]: any };
            fdpProtocolPolicyID_Params: { [key: string]: any };
            fdpProtocolValidator_AddressMainnet: string;
            fdpProtocolValidator_AddressTestnet: string;
            fdpProtocolValidator_Script: { [key: string]: any };
            fdpProtocolValidator_Hash: string;
            fdpProtocolValidator_Params: { [key: string]: any };

            fdpScriptPolicyID_CS: string;
            fdpScriptPolicyID_Script: { [key: string]: any };
            fdpScriptPolicyID_Params: { [key: string]: any };
            fdpScriptValidator_AddressMainnet: string;
            fdpScriptValidator_AddressTestnet: string;
            fdpScriptValidator_Script: { [key: string]: any };
            fdpScriptValidator_Hash: string;
            fdpScriptValidator_Params: { [key: string]: any };

            fdpCampaignFactories: { [key: string]: any }[];

            createdAt: Date;
            updatedAt: Date;
        }

        interface Interface extends InterfaceDB, ProtocolDatum {}

        //TODO: Esto es obligatorio así con SmartDB Entities
        const schemaDB = {
            ...BaseSmartDBEntityMongo.smartDBSchema,
            name: { type: String, required: true },
            fdpProtocolVersion: { type: Number, required: true },
            fdpScriptVersion: { type: Number, required: true },

            fdpProtocolPolicyID_CS: { type: String, required: true },
            fdpProtocolPolicyID_Script: { type: Object, required: true },
            fdpProtocolPolicyID_Params: { type: Object, required: true },
            fdpProtocolValidator_AddressMainnet: { type: String, required: true },
            fdpProtocolValidator_AddressTestnet: { type: String, required: true },
            fdpProtocolValidator_Script: { type: Object, required: true },
            fdpProtocolValidator_Hash: { type: String, required: true },
            fdpProtocolValidator_Params: { type: Object, required: true },
            fdpScriptPolicyID_CS: { type: String, required: true },
            fdpScriptPolicyID_Script: { type: Object, required: true },
            fdpScriptPolicyID_Params: { type: Object, required: true },
            fdpScriptValidator_AddressMainnet: { type: String, required: true },
            fdpScriptValidator_AddressTestnet: { type: String, required: true },
            fdpScriptValidator_Script: { type: Object, required: true },
            fdpScriptValidator_Hash: { type: String, required: true },
            fdpScriptValidator_Params: { type: Object, required: true },

            fdpCampaignFactories: { type: [Object], required: true },
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

