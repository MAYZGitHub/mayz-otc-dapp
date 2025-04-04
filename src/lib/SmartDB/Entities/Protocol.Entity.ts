import { PROTOCOL_ID_TN } from '@/utils/constants/on-chain';
import { type Script } from '@lucid-evolution/lucid';
import 'reflect-metadata';
import { BaseSmartDBEntity, type CS, Convertible, LUCID_NETWORK_MAINNET_NAME, asSmartDBEntity } from 'smart-db';

export interface ProtocolDatum {
    pd_admins: string[];
    pd_token_admin_policy_id: string;
    pd_mayz_policy_id: string;
    pd_mayz_tn: string;
    pd_mayz_deposit_requirement: bigint;
    pd_min_ada: bigint;
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

    @Convertible()
    fProtocolScript!: Script;

    @Convertible()
    fProtocolScript_Params!: object;

    @Convertible({ isUnique: true })
    fProtocolPolicyID_CS!: CS;

    @Convertible()
    fProtocolValidator_AddressMainnet!: string;

    @Convertible()
    fProtocolValidator_AddressTestnet!: string;

    @Convertible({ isUnique: true })
    fProtocolValidator_Hash!: string;

    @Convertible()
    fOTCScript!: Script;

    @Convertible()
    fOTCScript_Params!: object;

    @Convertible()
    fOTCPolicyID_CS!: CS;

    @Convertible()
    fOTCValidator_AddressMainnet!: string;

    @Convertible()
    fOTCValidator_AddressTestnet!: string;

    @Convertible()
    fOTCValidator_Hash!: string;

    @Convertible()
    fOTC_NFT_PRE_Script!: Script;

    @Convertible({ isForDatum: true, type: String })
    pd_admins!: string[];
    @Convertible({ isForDatum: true })
    pd_token_admin_policy_id!: string;
    @Convertible({ isForDatum: true })
    pd_mayz_policy_id!: string;
    @Convertible({ isForDatum: true })
    pd_mayz_tn!: string;
    @Convertible({ isForDatum: true })
    pd_mayz_deposit_requirement!: bigint;
    @Convertible({ isForDatum: true })
    pd_min_ada!: bigint;

    // #endregion fields

    // #region db

    public static defaultFieldsWhenUndefined: Record<string, boolean> = {};

    public static alwaysFieldsForSelect: Record<string, boolean> = {};

    // #endregion db

    // #region class methods

    public getNet_Address(): string {
        if (process.env.NEXT_PUBLIC_CARDANO_NET === LUCID_NETWORK_MAINNET_NAME) {
            return this.fProtocolValidator_AddressMainnet;
        } else {
            return this.fProtocolValidator_AddressTestnet;
        }
    }

    public getNET_id_CS(): string {
        return this.fProtocolPolicyID_CS;
    }


    public getOTC_Net_Address(): string {
        if (process.env.NEXT_PUBLIC_CARDANO_NET === LUCID_NETWORK_MAINNET_NAME) {
            return this.fOTCValidator_AddressMainnet;
        } else {
            return this.fOTCValidator_AddressTestnet;
        }
    }

    public getOTC_NET_id_CS(): string {
        return this.fOTCPolicyID_CS;
    }

    // #endregion class methods
}
