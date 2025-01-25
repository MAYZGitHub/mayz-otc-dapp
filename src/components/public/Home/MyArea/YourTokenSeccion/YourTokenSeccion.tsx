// YourTokenSeccion.tsx
import TokenCard from '@root/src/components/Common/TokenCard/TokenCard';
import { useYourTokenSeccion } from './useYourTokenSeccion'
import styles from './YourTokenSeccion.module.scss'

import messiImage from '@root/public/messi.jpg'

export default function YourTokenSeccion(prop: any) {
    const { deployBtnHandler,
        isLoadingDetails,
        isLoadedDetails,
        current,
        tokenCardInterface } = useYourTokenSeccion(prop.settersModalTx);
    const tokens = () =>
    (
        tokenCardInterface()?.map(token =>
            <TokenCard image={token.srcImageToken} photoAlt={token.photoAlt} tokenName={token.tokenName} tokenAmount={token.tokenAmount} btnHandler={token.btnHandler} />
        )
    )
    return (
        <section className={styles.yourTokenSeccionContainer}>
            <text className={styles.seccionCaption}> Your tokens </text>
            <div className={styles.separator} />
            <div className={styles.tokenGrid}>
                { tokens()}
            </div>
        </section>
    );
}

