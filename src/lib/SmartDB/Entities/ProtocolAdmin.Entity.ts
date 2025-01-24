import 'reflect-metadata';
import { Convertible, BaseSmartDBEntity, asSmartDBEntity, type TN } from 'smart-db';
import { VrfKeyHash, type PolicyId,  } from 'lucid-cardano';
import { protocolIdTn } from '../../Commons/Constants/onchain';

@asSmartDBEntity()
export class ProtocolAdminEntity extends BaseSmartDBEntity {
    protected static _apiRoute: string = 'protocoladmin';
    protected static _className: string = 'ProtocolAdmin';

    protected static _plutusDataIsSubType = false;
    protected static _is_NET_id_Unique = true;
    // TODO: Ckeck name and parameters
    _NET_id_TN: string = protocolIdTn;

    // #region fields
    @Convertible( { isForDatum: true,  type: String} )
    pd_admins!:  VrfKeyHash[] ;
    @Convertible( { isForDatum: true,  } )
    pd_token_admin_policy_id!:  PolicyId ;
    @Convertible( { isForDatum: true,  } )
    pd_mayz_policy_id!:  PolicyId ;
    @Convertible( { isForDatum: true,  } )
    pd_mayz_tn!:  TN ;
    @Convertible( { isForDatum: true,  } )
    pd_mayz_deposit_requirement!:  bigint ;
    @Convertible( { isForDatum: true,  } )
    pd_min_ada!:  bigint ;

    // #endregion fields

    // #region db

    public static defaultFieldsWhenUndefined: Record<string, boolean> = {};

    public static alwaysFieldsForSelect: Record<string, boolean> = {
        ...super.alwaysFieldsForSelect,
          pd_admins: true,
          pd_token_admin_policy_id: true,
          pd_mayz_policy_id: true,
          pd_mayz_tn: true,
          pd_mayz_deposit_requirement: true,
          pd_min_ada: true,
    };

    // #endregion db
}


