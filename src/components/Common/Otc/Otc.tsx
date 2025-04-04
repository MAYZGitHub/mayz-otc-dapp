// Otc.tsx
import { useOtc } from './useOtc';
import styles from './Otc.module.scss';
import OtcCard from './OtcCard/OtcCard';

export default function Otc(prop: any) {
    const {} = useOtc();
    console.log(prop.tokens);
    const otcElems = prop.tokens.map((token: any) => (
        <OtcCard key={token.tokenName} image={token.srcImageToken} photoAlt={token.photoAlt} tokenName={token.tokenName} tokenAmount={token.tokenAmount} btnMod={token.btnMod} />
    ));

    return (
        <section className={styles.OtcContainer}>
            <text className={styles.seccionCaption}> {prop.seccionCaption}</text>
            <div className={styles.separator}> </div>

            {otcElems}
        </section>
    );
}
