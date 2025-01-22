// Claim.tsx
import { useClaim } from './useClaim';
import styles from './Claim.module.scss'
import SearchElement from './SearchElement/SearchElement';
import Otc from '@/components/Common/Otc/Otc';

import messiImage from '@root/public/messi.jpg'

export default function Claim() {
    const { } = useClaim();
    function claimBtnHandler () {
        console.log("Claimear OTC")
    }
    const claimBtn = ( <button type='button' className={styles.claim} onClick={claimBtnHandler}>Claim</button> )
    
    const tokenProp =[{srcImageToken: messiImage, photoAlt: 'Messi', tokenName:'Messi', tokenAmount:10, btnMod:claimBtn},
        {srcImageToken: messiImage, photoAlt: 'Messi', tokenName:'Messi', tokenAmount:100000, btnMod:claimBtn}]

    return (
        <section className={styles.claimSection}>
            <SearchElement />
            <Otc seccionCaption="New's OTC" tokens={tokenProp}/>
        </section>
    );
}

