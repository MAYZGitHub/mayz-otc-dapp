// TokenCard.tsx
import { useTokenCard } from './useTokenCard';
import styles from './TokenCard.module.scss';
import BlueButton from '../Buttons/BlueButton/BlueButton';
import { Token_With_Metadata_And_Amount, getUrlForImage, hexToStr, useAppStore } from 'smart-db';
import Image from 'next/image';
import { ADA, GENERIC } from '@/utils/constants/images';
import { TxEnums } from '@/utils/constants/on-chain';
import LoaderButton from '../LoaderButton/LoaderButton';

interface TokenCardProps {
    token: Token_With_Metadata_And_Amount;
    createOTCBtnHandler: (token: Token_With_Metadata_And_Amount) => Promise<void>;
}
export default function TokenCard(prop: TokenCardProps) {
    const { handleInputChange, amount, imageSize } = useTokenCard();
    const appStore = useAppStore();
    return (
        <section className={styles.tokenCardContainer}>
            <Image
                className={styles.tokenPhoto}
                src={prop.token.image !== undefined ? getUrlForImage(prop.token.image) : GENERIC}
                alt={prop.token.TN_Hex}
                width={imageSize} // specify actual width
                height={imageSize} // specify actual height
                unoptimized // optionally remove this if you're using an image loader or CDN
            />
            <div className={styles.tokenName}>{hexToStr(prop.token.TN_Hex)}</div>
            <div className={styles.tokenAmount}>{prop.token.amount.toString()}</div>
            <div className={styles.separator} />
            <div className={styles.tokenAmountForm}>
                <div className={styles.tokenAmountCaption}>Amount:</div>
                <input className={styles.tokenAmountInput} onChange={(e) => handleInputChange(e)} type="number" name="amount" />
                <BlueButton
                    style={styles.deployButton}
                    onClick={() => {
                        prop.createOTCBtnHandler({
                            ...prop.token,
                            amount: BigInt(amount),
                        });
                    }}
                >
                    Create OTC {appStore.isProcessingTx === true && appStore.processingTxName === TxEnums.OTC_CREATE && <LoaderButton />}
                </BlueButton>
            </div>
        </section>
    );
}
