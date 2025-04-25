import { getUrlForImage, hexToStr } from 'smart-db';
import { TokensInterface } from './types';
import { OtcCardProps } from '@/components/Common/Otc/OtcCard/OtcCard';

export function tokenMetadataToOtcCard(tokens: TokensInterface): OtcCardProps {
    return {
        image: getUrlForImage(tokens.token.image),
        photoAlt: hexToStr(tokens.token.TN_Hex),
        tokenName: hexToStr(tokens.token.TN_Hex),
        tokenAmount: tokens.token.amount,
        btnMod: tokens.btnHandler,
    };
}
