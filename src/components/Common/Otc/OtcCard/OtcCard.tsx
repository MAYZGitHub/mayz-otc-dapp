// OtcCard.tsx
import styles from './OtcCard.module.scss';
import Image from 'next/image';
import { getUrlForImage } from 'smart-db';
import { GENERIC } from '@/utils/constants/images';
import { ReactNode } from 'react';

export interface OtcCardProps {
    image: string;
    photoAlt: string;
    tokenName: string;
    tokenAmount: bigint;
    btnMod: ReactNode;
}

export default function OtcCard({ image, photoAlt, tokenName, tokenAmount, btnMod }: OtcCardProps) {
    return (
        <section className={styles.otcCardContainer}>
            <div className={styles.otcBox}>
                <div className={styles.otcDescription}>
                    <Image
                        className={styles.otcTokenPhoto}
                        src={image !== '' ? getUrlForImage(image) : GENERIC}
                        alt={photoAlt}
                        width={65} // ajusta el tamaño real
                        height={65} // ajusta el tamaño real
                        unoptimized // quítalo si estás usando un CDN o loader
                    />
                    <div className={styles.otcTokenName}> {tokenName} </div>
                </div>
                <span className={styles.tokenAmount}> {tokenAmount.toString()} Tokens </span>
                {btnMod}
                {/*<button type='button' onClick={() => console.log("Claimear OTC")}>Claim</button>*/}
            </div>
            <div className={styles.separator}> </div>
        </section>
    );
}
