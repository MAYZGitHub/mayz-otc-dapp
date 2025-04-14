// MyArea.tsx
import { useMyArea } from './useMyArea';
import styles from './MyArea.module.scss'
import Otc from '@/components/Common/Otc/Otc';
import YourTokenSeccion from './YourTokenSeccion/YourTokenSeccion';

export default function MyArea(props: any) {
    const { 
        tokensOTCToCancelInterface,
        tokensOTCToCloseInterface,
        deployBtnHandler,
    } = useMyArea(props.listOfOtcEntityWithTokens, props.walletTokens);
    //---------------------------------------------------
    const otcUnions = () => {
        const cancelElem = tokensOTCToCancelInterface?.map(token => { return { ...token, btnMod: (<button type='button' className={styles.cancel} onClick={token.btnHandler}>Cancel</button>) } })
        const closeElem = tokensOTCToCloseInterface?.map(token => {return {...token, btnMod: (<button type='button' className={styles.close} onClick={token.btnHandler}>Close</button>)}})
        return [...cancelElem, ...closeElem]
    }
    //---------------------------------------------------
    return (
        <section className={styles.myAreaSection}>
            <YourTokenSeccion walletTokens={props.walletTokens} deployBtnHandler={deployBtnHandler}/>
            <Otc seccionCaption="Your Open OTC" tokens={otcUnions()} />
        </section>
    );
}

