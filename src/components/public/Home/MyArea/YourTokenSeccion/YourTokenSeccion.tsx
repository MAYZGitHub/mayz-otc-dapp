// YourTokenSeccion.tsx
import TokenCard from '@/components/Common/TokenCard/TokenCard';
import { Token_With_Metadata_And_Amount } from 'smart-db';
import styles from './YourTokenSeccion.module.scss';

interface YourTokenSeccionProps {
    walletTokens: Token_With_Metadata_And_Amount[];
    deployBtnHandler: (token: Token_With_Metadata_And_Amount) => Promise<void>;
}
export default function YourTokenSeccion(props: YourTokenSeccionProps) {
    const tokens = () => props.walletTokens?.map((token) => <TokenCard key={token.TN_Hex} token={token} deployBtnHandler={props.deployBtnHandler} />);
    return (
        <section className={styles.yourTokenSeccionContainer}>
            <text className={styles.seccionCaption}>Your tokens </text>
            <div className={styles.separator} />
            <div className={styles.tokenGrid}>{tokens()}</div>
        </section>
    );
}
