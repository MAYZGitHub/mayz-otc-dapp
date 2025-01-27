import { MeshWallet } from '@meshsdk/core';
import { Script } from 'lucid-cardano';
import { scriptSchema, yup } from 'smart-db/backEnd';


export const OTC_CREATE = 'Otc - Create';
export const OTC_CLAIM = 'Otc - Claim';
export const OTC_CLOSE = 'Otc - Close';
export const OTC_CANCEL = 'Otc - Cancel';


export interface CreateOTCTxParams {
    lockAmount: bigint,
    otcSmartContract_CS: string,
    lockTokenTN: string,
    lockTokenCS: string,
    tokenOwnerId: string,
    tokenOwnerTN: string,
    otcSmartContractAddress: string,
    ownerNFT_Script: string
}

export const CreateOtcTxParamsSchema = yup.object().shape({
    lockAmount: yup.mixed().required(),
    otcSmartContract_CS: yup.string().required(),
    lockTokenTN: yup.string().required(),
    lockTokenCS: yup.string().required(),
    otcNftPolicyId: yup.string().required(),
    otcSmartContractAddress: yup.string().required(),
    mintingOtcNFT: scriptSchema.required()
});

export interface ClaimOTCTxParams {
    otcDbId: string,
    otcSmartContractAddress: string,
    otcScript: Script
}

export const ClaimOtcTxParamsSchema = yup.object().shape({
    otcDbId: yup.string().required(),
    otcSmartContractAddress: yup.string().required(),
    otcScript: scriptSchema.required()
});

export interface CloseOTCTxParams {
    otcDbId: string,
    otcSmartContractAddress: string,
    otcScript: Script,
    mintingOtcNFT: Script
}

export const CloseOtcTxParamsSchema = yup.object().shape({
    otcDbId: yup.string().required(),
    otcSmartContractAddress: yup.string().required(),
    otcScript: scriptSchema.required(),
    mintingOtcNFT: scriptSchema.required()
});

export interface CancelOTCTxParams {
    otcDbId: string,
    otcSmartContractAddress: string,
    otcScript: Script,
    mintingOtcNFT: Script
}

export const CancelOtcTxParamsSchema = yup.object().shape({
    otcDbId: yup.string().required(),
    otcSmartContractAddress: yup.string().required(),
    otcScript: scriptSchema.required(),
    mintingOtcNFT: scriptSchema.required()
});

export const PROTOCOL_CREATE = 'Otc - Create';
export const PROTOCOL_UPDATE_PARAMS = 'Otc - Update Params';
export const PROTOCOL_UPDATE_MIN_ADA = 'Otc - Update Min ADA';

export interface CreateProtocolTxParams {
    mayzAmount: bigint,
    meshWallet: MeshWallet,
}

export const CreateProtocolTxParamsSchema = yup.object().shape({
    mayzAmount: yup.mixed().required(),
    meshWallet: yup.object().required()
});