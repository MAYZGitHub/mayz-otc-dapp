// TokenCard.tsx
import { useTokenCard } from './useTokenCard';
import styles from './TokenCard.module.scss'

export default function TokenCard(prop: any) {
    const { handleInputChange, amount } = useTokenCard();

    return (
        <section className={styles.tokenCardContainer}>
            <img className={styles.tokenPhoto} src={prop.image} alt={prop.photoAlt} />
            <text className={styles.tokenName}> {prop.tokenName} </text>
            <text className={styles.tokenAmount}> {prop.tokenAmount} </text>
            <div className={styles.separator}/>
            <form className={styles.tokenAmountForm}>
                <text className={styles.tokenAmountCaption} >
                    Amount:
                </text>
                <input className={styles.tokenAmountInput} onChange={(e)=>handleInputChange(e) } type='number' name='amount'/>
                <button className={styles.deployButton} type='button' onClick={() => console.log(prop.btnHandler(amount))}> Deploy </button>
            </form>
        </section>
    );
}

