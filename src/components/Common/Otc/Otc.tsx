// Otc.tsx
import { useOtc } from './useOtc';
import styles from './Otc.module.scss'
import OtcCard from './OtcCard/OtcCard';

import messiImage from './../../../../public/messi.jpg'

export default function Otc() {
    const { } = useOtc();

    return (
        <section className={styles.OtcContainer}>
            <text className={styles.seccionCaption}> New's OTC</text>
            <OtcCard image={messiImage} photoAlt="Messi" tokenName="Messi" tokenAmount={100000} />
            <OtcCard image={messiImage} photoAlt="Messi" tokenName="Messi" tokenAmount={10} />

        </section>
    );
}

