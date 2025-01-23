import { Script } from 'lucid-cardano';
import { scriptSchema, yup } from 'smart-db/backEnd';


export const OTC_CREATE = 'Otc - Create';
export const OTC_CLAIM = 'Otc - Claim';
export const OTC_CLOSE = 'Otc - Close';
export const OTC_CANCEL = 'Otc - Cancel';


export interface CreateOTCTxParams {
    lockAmount: bigint,
    policyIdCS: string,
    lockTokenTN: string,
    lockTokenCS: string,
    otcNftPolicyId: string,
    validatorAddress: string,
    mintingOtcNFT: Script
}

export const CreateOtcTxParamsSchema = yup.object().shape({
    lockAmount: yup.mixed().required(),
    policyIdCS: yup.string().required(),
    lockTokenTN: yup.string().required(),
    lockTokenCS: yup.string().required(),
    otcNftPolicyId: yup.string().required(),
    validatorAddress: yup.string().required(),
    mintingOtcNFT: scriptSchema.required()
});

export interface ClaimOTCTxParams {
    otcDbId: string,
    validatorAddress: string,
    OTCScript: Script
}

export const ClaimOtcTxParamsSchema = yup.object().shape({
    otcDbId: yup.string().required(),
    validatorAddress: yup.string().required(),
    OTCScript: scriptSchema.required()
});

export interface CloseOTCTxParams {
    otcDbId: string,
    validatorAddress: string,
    OTCScript: Script,
    mintingOtcNFT: Script
}

export const CloseOtcTxParamsSchema = yup.object().shape({
    otcDbId: yup.string().required(),
    validatorAddress: yup.string().required(),
    OTCScript: scriptSchema.required(),
    mintingOtcNFT: scriptSchema.required()
});

export interface CancelOTCTxParams {
    otcDbId: string,
    validatorAddress: string,
    OTCScript: Script,
    mintingOtcNFT: Script
}

export const CancelOtcTxParamsSchema = yup.object().shape({
    otcDbId: yup.string().required(),
    validatorAddress: yup.string().required(),
    OTCScript: scriptSchema.required(),
    mintingOtcNFT: scriptSchema.required()
});