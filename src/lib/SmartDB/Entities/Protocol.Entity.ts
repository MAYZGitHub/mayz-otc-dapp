import { PROTOCOL_ID_TN } from '@/utils/constants/on-chain';
import { type Script } from '@lucid-evolution/lucid';
import 'reflect-metadata';
import { BaseSmartDBEntity, type CS, Convertible, LUCID_NETWORK_MAINNET_NAME, asSmartDBEntity } from 'smart-db';

export type CampaignFactory = {
    name: string;
    fdpCampaignVersion: number;
    fdpCampaignPolicy_Pre_CborHex: Script;
    fdpCampaignValidator_Pre_CborHex: Script;
    fdpCampaignFundsPolicyID_Pre_CborHex: Script;
    fdpCampaignFundsValidator_Pre_CborHex: Script;
};

export interface ProtocolDatum {
    pdProtocolVersion: number;
    pdAdmins: string[];
    pdTokenAdminPolicy_CS: string;
    pdMinADA: bigint;
}

@asSmartDBEntity()
export class ProtocolEntity extends BaseSmartDBEntity {
    protected static _apiRoute: string = 'protocol';
    protected static _className: string = 'Protocol';

    protected static _plutusDataIsSubType = true;

    protected static _isOnlyDatum = false;

    _NET_id_TN_Str: string = PROTOCOL_ID_TN;

    // #region fields

    @Convertible({ isUnique: true })
    name!: string;

    @Convertible({})
    fdpProtocolVersion!: number;

    @Convertible({})
    fdpScriptVersion!: number;

    @Convertible({ isUnique: true })
    fdpProtocolPolicyID_CS!: CS;

    @Convertible()
    fdpProtocolPolicyID_Script!: Script;

    @Convertible()
    fdpProtocolPolicyID_Params!: object;

    @Convertible()
    fdpProtocolValidator_AddressMainnet!: string;

    @Convertible()
    fdpProtocolValidator_AddressTestnet!: string;

    @Convertible()
    fdpProtocolValidator_Script!: Script;

    @Convertible({ isUnique: true })
    fdpProtocolValidator_Hash!: string;

    @Convertible()
    fdpProtocolValidator_Params!: object;

    @Convertible()
    fdpScriptPolicyID_CS!: CS;

    @Convertible()
    fdpScriptPolicyID_Script!: Script;

    @Convertible()
    fdpScriptPolicyID_Params!: object;

    @Convertible()
    fdpScriptValidator_AddressMainnet!: string;

    @Convertible()
    fdpScriptValidator_AddressTestnet!: string;

    @Convertible()
    fdpScriptValidator_Script!: Script;

    @Convertible()
    fdpScriptValidator_Hash!: string;

    @Convertible()
    fdpScriptValidator_Params!: object;

    @Convertible({ type: Object })
    fdpCampaignFactories!: CampaignFactory[];
    @Convertible( { isForDatum: true,  type: String} )
    pd_admins!:  string[] ;
    @Convertible( { isForDatum: true,  } )
    pd_token_admin_policy_id!:  string ;
    @Convertible( { isForDatum: true,  } )
    pd_mayz_policy_id!:  string ;
    @Convertible( { isForDatum: true,  } )
    pd_mayz_tn!:  string ;
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


