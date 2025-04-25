import 'reflect-metadata';
import { Convertible, BaseSmartDBEntity, asSmartDBEntity, type TN, type PaymentPubKey } from 'smart-db';
import { type PolicyId } from '@lucid-evolution/lucid';
import { OTC_ID_TN_Str } from '@/utils/constants/on-chain';

export interface OTCDatum {
    od_creator: PaymentPubKey;
    od_token_policy_id: PolicyId;
    od_token_tn: TN;
    od_token_amount: bigint;
    od_otc_nft_policy_id: PolicyId;
    od_otc_nft_tn: TN;
    od_mayz_policy_id: PolicyId;
    od_mayz_tn: TN;
    od_mayz_locked: bigint;
    od_min_ada: bigint;
}

@asSmartDBEntity()
export class OTCEntity extends BaseSmartDBEntity {
    protected static _apiRoute: string = 'otc';
    protected static _className: string = 'OTC';

    protected static _plutusDataIsSubType = false;

    protected static _isOnlyDatum = true; // Indicates that this entity is only a datum and do nt have other fields to save in the db.

    // The _is_NET_id_Unique flag indicates whether the Token ID is unique in the datum (for NFTs) or if it's a fungible token (FT).
    protected static _is_NET_id_Unique = false;

    _NET_id_TN_Str: string = OTC_ID_TN_Str;

    // #region fields
    @Convertible({ isForDatum: true })
    od_creator!: PaymentPubKey;
    @Convertible({ isForDatum: true })
    od_token_policy_id!: PolicyId;
    @Convertible({ isForDatum: true })
    od_token_tn!: TN;
    @Convertible({ isForDatum: true })
    od_token_amount!: bigint;
    @Convertible({ isForDatum: true })
    od_otc_nft_policy_id!: PolicyId;
    @Convertible({ isForDatum: true })
    od_otc_nft_tn!: TN;
    @Convertible({ isForDatum: true })
    od_mayz_policy_id!: PolicyId;
    @Convertible({ isForDatum: true })
    od_mayz_tn!: TN;
    @Convertible({ isForDatum: true })
    od_mayz_locked!: bigint;
    @Convertible({ isForDatum: true })
    od_min_ada!: bigint;

    // #endregion fields

    // #region db

    public static defaultFieldsWhenUndefined: Record<string, boolean> = {};

    public static alwaysFieldsForSelect: Record<string, boolean> = {};

    // #endregion db
}
