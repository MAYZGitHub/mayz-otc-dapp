
import { Schema, model, models } from 'mongoose';
import 'reflect-metadata';
import { MongoAppliedFor , TN } from 'smart-db';
import {  BaseSmartDBEntityMongo, IBaseSmartDBEntity } from 'smart-db/backEnd';
import { OTCEntity } from './OTC.Entity';
import { VrfKeyHash, PolicyId,  } from 'lucid-cardano';

@MongoAppliedFor([OTCEntity])
export class OTCEntityMongo extends  BaseSmartDBEntityMongo {
    protected static Entity = OTCEntity;
    protected static _mongoTableName: string = OTCEntity.className();

    // #region fields

    // od_creator: VrfKeyHash 
    // od_token_policy_id: PolicyId 
    // od_token_tn: TN 
    // od_token_amount: bigint 
    // od_otc_nft_policy_id: PolicyId 
    // od_otc_nft_tn: TN 
    // od_mayz_policy_id: PolicyId 
    // od_mayz_tn: TN 
    // od_mayz_locked: bigint 
    // od_min_ada: bigint 

    // #endregion fields

    // #region internal class methods

    public getMongoStatic(): typeof OTCEntityMongo {
        return this.constructor as typeof OTCEntityMongo;
    }

    public static getMongoStatic(): typeof OTCEntityMongo {
        return this as typeof OTCEntityMongo;
    }

    public getStatic(): typeof OTCEntity {
        return this.getMongoStatic().getStatic() as typeof OTCEntity;
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

    // #region mongo db

    public static MongoModel() {
        interface Interface {
            od_creator:  VrfKeyHash ;
            od_token_policy_id:  PolicyId ;
            od_token_tn:  TN ;
            od_token_amount:  bigint ;
            od_otc_nft_policy_id:  PolicyId ;
            od_otc_nft_tn:  TN ;
            od_mayz_policy_id:  PolicyId ;
            od_mayz_tn:  TN ;
            od_mayz_locked:  bigint ;
            od_min_ada:  bigint ;
        }

        const schema = new Schema<Interface>({
            od_creator: { type: String, required: true },
            od_token_policy_id: { type: String, required: true },
            od_token_tn: { type: String, required: true },
            od_token_amount: { type: String, required: true },
            od_otc_nft_policy_id: { type: String, required: true },
            od_otc_nft_tn: { type: String, required: true },
            od_mayz_policy_id: { type: String, required: true },
            od_mayz_tn: { type: String, required: true },
            od_mayz_locked: { type: String, required: true },
            od_min_ada: { type: String, required: true },
        });

        const ModelDB = models[this._mongoTableName] || model<Interface>(this._mongoTableName, schema);
        return ModelDB;
    }

    // #endregion mongo db
}

