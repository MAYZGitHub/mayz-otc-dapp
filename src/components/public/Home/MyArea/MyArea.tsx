// MyArea.tsx
import Otc from '@/components/Common/Otc/Otc';
import styles from './MyArea.module.scss';
import { MyAreaProps, useMyArea } from './useMyArea';
import YourTokenSeccion from './YourTokenSeccion/YourTokenSeccion';

export default function MyArea({ walletTokens, listOfOtcEntityWithTokens }: MyAreaProps) {
    const { tokensOTCToCancelInterface, tokensOTCToCloseInterface, createOTCBtnHandler } = useMyArea({ walletTokens, listOfOtcEntityWithTokens });
    //---------------------------------------------------
    const otcUnions = () => {
        const cancelElem = tokensOTCToCancelInterface?.map((token) => {
            return {
                ...token,
                btnHandler: (
                    <button type="button" className={styles.cancel} onClick={token.btnHandler}>
                        Cancel
                    </button>
                ),
            };
        });
        const closeElem = tokensOTCToCloseInterface?.map((token) => {
            return {
                ...token,
                btnHandler: (
                    <button type="button" className={styles.close} onClick={token.btnHandler}>
                        Close
                    </button>
                ),
            };
        });
        return [...cancelElem, ...closeElem];
    };
    console.log(otcUnions());
    //---------------------------------------------------
    return (
        <section className={styles.myAreaSection}>
            <YourTokenSeccion walletTokens={walletTokens} createOTCBtnHandler={createOTCBtnHandler} />
            <Otc seccionCaption="Your Open OTC" tokens={otcUnions()} />
        </section>
    );
}
