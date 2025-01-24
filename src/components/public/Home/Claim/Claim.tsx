// Claim.tsx
import { useClaim } from './useClaim';
import styles from './Claim.module.scss'
import SearchElement from './SearchElement/SearchElement';
import Otc from '@/components/Common/Otc/Otc';

import messiImage from '@root/public/messi.jpg'
import { useMemo } from 'react';

const tokenProp =
[   {srcImageToken: messiImage, photoAlt: 'Messi', tokenName:'Messi', tokenAmount:10},
    {srcImageToken: messiImage, photoAlt: 'Ronaldo', tokenName:'Ronaldo', tokenAmount:10},
    {srcImageToken: messiImage, photoAlt: 'Neymar', tokenName:'Neymar', tokenAmount:10},
    {srcImageToken: messiImage, photoAlt: 'Mbappe', tokenName:'Mbappe', tokenAmount:10},
    {srcImageToken: messiImage, photoAlt: 'Lewandowski', tokenName:'Lewandowski', tokenAmount:10},
    {srcImageToken: messiImage, photoAlt: 'Salah', tokenName:'Salah', tokenAmount:10},
    {srcImageToken: messiImage, photoAlt: 'Modric', tokenName:'Modric', tokenAmount:10},
    {srcImageToken: messiImage, photoAlt: 'Kane', tokenName:'Kane', tokenAmount:10},
    {srcImageToken: messiImage, photoAlt: 'Hazard', tokenName:'Hazard', tokenAmount:10},
     {srcImageToken: messiImage, photoAlt: 'De Bruyne', tokenName:'De Bruyne', tokenAmount:100000}
]

export default function Claim() {
    const { searchTerm, handleInputChange } = useClaim();
    function claimBtnHandler () {
        console.log("Claimear OTC")
    }
    const claimBtn = ( <button type='button' className={styles.claim} onClick={claimBtnHandler}>Claim</button> )
    
    const filteredItems = useMemo(() => {
        if (!searchTerm) {
          return tokenProp; // Mostrar todos los elementos si el campo de búsqueda está vacío
        }
    
        const lowerSearchTerm = searchTerm.toLowerCase();
    
        return tokenProp.filter(item =>
          item.tokenName.toLowerCase().includes(lowerSearchTerm) //||
          //item.id.toString().includes(searchTerm) ||
        );
      }, [searchTerm]);
    
    return (
        <section className={styles.claimSection}>
            <SearchElement handleInputChange={handleInputChange} />
            <Otc seccionCaption="New's OTC" tokens={filteredItems}/>
        </section>
    );
}

