import { BaseTxRedeemer } from "smart-db";

// Define a type that represents a Redeemer for a Policy ID, 
// which can either be related to Minting or Burning an ID.
export type PolicyIdRedeemer = MintNFT | BurnNFT;

// Class for handling a Minting operation on a Policy ID.
// It extends from BaseTxRedeemer to inherit common functionality for a transaction redeemer.
export class MintNFT extends BaseTxRedeemer {
    // The index of the Plutus data associated with this redeemer.
    protected static _plutusDataIndex = 1;
    
    // Indicates that this redeemer is a subtype of a more general type.
    protected static _plutusDataIsSubType = true;
}

// Class for handling a Burning operation on a Policy ID.
// It extends from BaseTxRedeemer to inherit common functionality for a transaction redeemer.
export class BurnNFT extends BaseTxRedeemer {
    // The index of the Plutus data associated with this redeemer.
    protected static _plutusDataIndex = 2;
    
    // Indicates that this redeemer is a subtype of a more general type.
    protected static _plutusDataIsSubType = true;
}

export type OTCRedeemer = CreateOTC | ClaimOTC | CloseOTC | CancelOTC | UpdateOTCMinAda;

export class CreateOTC extends BaseTxRedeemer {
    // The index of the Plutus data associated with this redeemer.
    protected static _plutusDataIndex = 0;
    
    // Indicates that this redeemer is a subtype of a more general type.
    protected static _plutusDataIsSubType = true;
}

export class ClaimOTC extends BaseTxRedeemer {
    // The index of the Plutus data associated with this redeemer.
    protected static _plutusDataIndex = 1;
    
    // Indicates that this redeemer is a subtype of a more general type.
    protected static _plutusDataIsSubType = true;
}

// Class for handling a CloseOTC operation in the Market.
// It extends from BaseTxRedeemer to inherit common functionality for a transaction redeemer.
export class CloseOTC extends BaseTxRedeemer {
    // The index of the Plutus data associated with this redeemer.
    protected static _plutusDataIndex = 2;
    
    // Indicates that this redeemer is a subtype of a more general type.
    protected static _plutusDataIsSubType = true;
}

export class CancelOTC extends BaseTxRedeemer {
    // The index of the Plutus data associated with this redeemer.
    protected static _plutusDataIndex = 3;
    
    // Indicates that this redeemer is a subtype of a more general type.
    protected static _plutusDataIsSubType = true;
}

// Class for handling a CloseOTC operation in the Market.
// It extends from BaseTxRedeemer to inherit common functionality for a transaction redeemer.
export class UpdateOTCMinAda extends BaseTxRedeemer {
    // The index of the Plutus data associated with this redeemer.
    protected static _plutusDataIndex = 4;
    
    // Indicates that this redeemer is a subtype of a more general type.
    protected static _plutusDataIsSubType = true;
}
