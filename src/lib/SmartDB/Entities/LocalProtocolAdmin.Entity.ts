import 'reflect-metadata';
import { Convertible, BaseEntity, asEntity,type TN } from 'smart-db';
import {type Address,type PolicyId,  } from 'lucid-cardano';

@asEntity()
export class LocalProtocolAdminEntity extends BaseEntity {
    protected static _apiRoute: string = 'localprotocoladmin';
    protected static _className: string = 'LocalProtocolAdmin';


    // #region fields
    @Convertible()
    pp_protocol_address!:  Address ;
    @Convertible()
    pp_protocol_id_tn!:  TN ;
    @Convertible()
    pp_protocol_policy_id!:  PolicyId ;
    @Convertible()
    pp_protocol_script_hash!: string;

    // #endregion fields

    // #region db

    public static defaultFieldsWhenUndefined: Record<string, boolean> = {};

    public static alwaysFieldsForSelect: Record<string, boolean> = {
        ...super.alwaysFieldsForSelect,
          pp_protocol_address: true,
          pp_protocol_id_tn: true,
          pp_protocol_policy_id: true,
          pp_protocol_script_hash: true,
    };

    // #endregion db
}


