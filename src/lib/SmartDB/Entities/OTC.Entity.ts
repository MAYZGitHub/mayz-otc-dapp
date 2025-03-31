import 'reflect-metadata';
import { Convertible, BaseSmartDBEntity, asSmartDBEntity,type TN } from 'smart-db';
import {type VrfKeyHash,type PolicyId,  } from '@lucid-evolution/lucid';
import { otcSmartContractPolicyIdTn } from '@/utils/constants/on-chain';

@asSmartDBEntity()
export class OTCEntity extends BaseSmartDBEntity {
    protected static _apiRoute: string = 'otc';
    protected static _className: string = 'OTC';

    protected static _plutusDataIsSubType = false;
    protected static _is_NET_id_Unique = true;
    // TODO: Ckeck name and parameters
    _NET_id_TN_str: string = otcSmartContractPolicyIdTn;

    // #region fields
    @Convertible( { isForDatum: true,  } )
    od_creator!:  VrfKeyHash ;
    @Convertible( { isForDatum: true,  } )
    od_token_policy_id!:  PolicyId ;
    @Convertible( { isForDatum: true,  } )
    od_token_tn!:  TN ;
    @Convertible( { isForDatum: true,  } )
    od_token_amount!:  bigint ;
    @Convertible( { isForDatum: true,  } )
    od_otc_nft_policy_id!:  PolicyId ;
    @Convertible( { isForDatum: true,  } )
    od_otc_nft_tn!:  TN ;
    @Convertible( { isForDatum: true,  } )
    od_mayz_policy_id!:  PolicyId ;
    @Convertible( { isForDatum: true,  } )
    od_mayz_tn!:  TN ;
    @Convertible( { isForDatum: true,  } )
    od_mayz_locked!:  bigint ;
    @Convertible( { isForDatum: true,  } )
    od_min_ada!:  bigint ;

    // #endregion fields

    // #region db

    public static defaultFieldsWhenUndefined: Record<string, boolean> = {};

    public static alwaysFieldsForSelect: Record<string, boolean> = {
        ...super.alwaysFieldsForSelect,
          od_creator: true,
          od_token_policy_id: true,
          od_token_tn: true,
          od_token_amount: true,
          od_otc_nft_policy_id: true,
          od_otc_nft_tn: true,
          od_mayz_policy_id: true,
          od_mayz_tn: true,
          od_mayz_locked: true,
          od_min_ada: true,
    };

    // #endregion db
}


