import { BaseTxRedeemer } from 'smart-db';

export type ProtocolRedeemer = CreateProtocol | UpdateProtocolParams | UpdateProtocolMinADA;

export class CreateProtocol extends BaseTxRedeemer {
    // The index of the Plutus data associated with this redeemer.
    protected static _plutusDataIndex = 0;

    // Indicates that this redeemer is a subtype of a more general type.
    protected static _plutusDataIsSubType = false;
}

export class UpdateProtocolParams extends BaseTxRedeemer {
    // The index of the Plutus data associated with this redeemer.
    protected static _plutusDataIndex = 1;

    // Indicates that this redeemer is a subtype of a more general type.
    protected static _plutusDataIsSubType = false;
}

export class UpdateProtocolMinADA extends BaseTxRedeemer {
    // The index of the Plutus data associated with this redeemer.
    protected static _plutusDataIndex = 2;

    // Indicates that this redeemer is a subtype of a more general type.
    protected static _plutusDataIsSubType = false;
}
