// Otc.tsx
import { useOtc } from './useOtc';
import styles from './Otc.module.scss';
import OtcCard, { OtcCardProps } from './OtcCard/OtcCard';
import { getUrlForImage, hexToStr, Token_With_Metadata_And_Amount, TokenMetadataEntity } from 'smart-db';
import { ReactNode } from 'react';
import { TokensInterface } from '@/utils/types';
import { tokenMetadataToOtcCard } from '@/utils/utils';

export interface OtcProps {
    seccionCaption: string;
    tokens: TokensInterface[];
}

export default function Otc({ seccionCaption, tokens }: OtcProps) {
    const {} = useOtc();

    const otcElems = tokens.map((tokenInterface: TokensInterface) => (
        <OtcCard key={tokenInterface.token.TN_Hex + tokenInterface.token.CS} {...tokenMetadataToOtcCard(tokenInterface)}/>
    ));

    return (
        <section className={styles.OtcContainer}>
            <div className={styles.seccionCaption}> {seccionCaption}</div>
            <div className={styles.separator}> </div>

            {otcElems}
        </section>
    );
}
