// // Claim.tsx
// import { useClaim } from './useClaim';
// import styles from './Claim.module.scss'
// import SearchElement from './SearchElement/SearchElement';
// import Otc from '@/components/Common/Otc/Otc';

// export default function Claim(prop:  any) {
//     const { handleInputChange, filteredItems } = useClaim(prop.listOfOtcEntityWithTokens, prop.walletTokens, prop.settersModalTx);
//     const itemsWithButtom = () => {
//       const otcToClaimInterface = filteredItems;

//       return otcToClaimInterface?.map(token => { return { ...token, btnMod: (<button type='button' className={styles.claim} onClick={token.btnHandler}>Claim</button>) } })
//   }


//     return (
//         <section className={styles.claimSection}>
//             <SearchElement handleInputChange={handleInputChange} />
//             <Otc seccionCaption="New's OTC" tokens={itemsWithButtom()}/>
//         </section>
//     );
// }

