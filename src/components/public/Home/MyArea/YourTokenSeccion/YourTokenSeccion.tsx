// // YourTokenSeccion.tsx
// import TokenCard from '@/components/Common/TokenCard/TokenCard';
// import { useYourTokenSeccion } from './useYourTokenSeccion'
// import styles from './YourTokenSeccion.module.scss'


// export default function YourTokenSeccion(props: any) {
//     const {
//         tokenCardInterface } = useYourTokenSeccion(props.settersModalTx, props.walletTokens);
//     const tokens = () =>
//     (
//         tokenCardInterface()?.map(token =>
//             <TokenCard key={token.key} image={token.srcImageToken} photoAlt={token.photoAlt} tokenName={token.tokenName} tokenAmount={token.tokenAmount} btnHandler={token.btnHandler} />
//         )
//     )
    
//     return (
//         <section className={styles.yourTokenSeccionContainer}>
//             <text className={styles.seccionCaption}> Your tokens </text>
//             <div className={styles.separator} />
//             <div className={styles.tokenGrid}>
//                 {tokens()}
//             </div>
//         </section>
//     );
// }

