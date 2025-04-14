// OtcCard.tsx
import { useOtcCard } from './useOtcCard';
import styles from './OtcCard.module.scss';
import Image from 'next/image';

export default function OtcCard(prop: any) {
    const {} = useOtcCard();

    return (
        <section className={styles.otcCardContainer}>
            <div className={styles.otcBox}>
                <div className={styles.otcDescription}>
                    <Image
                        className={styles.otcTokenPhoto}
                        src={prop.image.src}
                        alt={prop.photoAlt}
                        width={65} // ajusta el tamaño real
                        height={65} // ajusta el tamaño real
                        unoptimized // quítalo si estás usando un CDN o loader
                    />
                    <div className={styles.otcTokenName}> {prop.tokenName} </div>
                </div>
                <span className={styles.tokenAmount}> {prop.tokenAmount} Tokens </span>
                {prop.btnMod}
                {/*<button type='button' onClick={() => console.log("Claimear OTC")}>Claim</button>*/}
            </div>
            <div className={styles.separator}> </div>
        </section>
    );
}
