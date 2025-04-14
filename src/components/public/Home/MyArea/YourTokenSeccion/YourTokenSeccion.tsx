// YourTokenSeccion.tsx
import TokenCard from '@/components/Common/TokenCard/TokenCard';
import { Token_With_Metadata_And_Amount, TokensWithMetadataAndAmount } from 'smart-db';
import styles from './YourTokenSeccion.module.scss';

interface YourTokenSeccionProps {
    walletTokens: TokensWithMetadataAndAmount | undefined;
    createOTCBtnHandler: (token: Token_With_Metadata_And_Amount) => Promise<void>;
}
export default function YourTokenSeccion(props: YourTokenSeccionProps) {
    const tokens = () => props.walletTokens?.map((token) => <TokenCard key={token.TN_Hex} token={token} createOTCBtnHandler={props.createOTCBtnHandler} />);
    return (
        <section className={styles.yourTokenSeccionContainer}>
            <div className={styles.seccionCaption}>Your tokens</div>
            <div className={styles.separator} />
            <div className={styles.tokenGrid}>{tokens()}</div>
        </section>
    );
}
