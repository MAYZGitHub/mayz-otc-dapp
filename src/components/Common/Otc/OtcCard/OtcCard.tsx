// OtcCard.tsx
import { useOtcCard } from './useOtcCard';
import styles from './OtcCard.module.scss'

export default function OtcCard(prop : any) {
    const { } = useOtcCard();

    return (
        <section className={styles.otcCardContainer}>
            <div className={styles.separator}> </div>
            <div className={styles.otcBox}>
                <div className={styles.otcDescription}>
                    <img className={styles.otcTokenPhoto} src={prop.image.src} alt={prop.photoAlt} />
                    <text className={styles.otcTokenName}> {prop.tokenName} </text>
                </div>
                <span className={styles.tokenAmount}> {prop.tokenAmount} Tokens </span>
                {prop.btnMod}
                {/*<button type='button' onClick={() => console.log("Claimear OTC")}>Claim</button>*/}
            </div>

        </section>
    );
}