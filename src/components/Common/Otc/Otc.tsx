// Otc.tsx
import styles from './Otc.module.scss';
import OtcCard from './OtcCard/OtcCard';

import { TokensInterface } from '@/utils/types';
import { tokenMetadataToOtcCard } from '@/utils/utils';

export interface OtcProps {
    seccionCaption: string;
    tokens: TokensInterface[];
}

export default function Otc({ seccionCaption, tokens }: OtcProps) {
    const otcElems = tokens.map((tokenInterface: TokensInterface) => (
        <OtcCard key={tokenInterface.token.TN_Hex + tokenInterface.token.CS} {...tokenMetadataToOtcCard(tokenInterface)} />
    ));

    return (
        <section className={styles.OtcContainer}>
            <div className={styles.seccionCaption}> {seccionCaption}</div>
            <div className={styles.separator}> </div>

            {otcElems}
        </section>
    );
}
