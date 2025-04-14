// TokenCard.tsx
import { useTokenCard } from './useTokenCard';
import styles from './TokenCard.module.scss';
import BlueButton from '../Buttons/BlueButton/BlueButton';
import { Token_With_Metadata_And_Amount, getUrlForImage, hexToStr } from 'smart-db';

interface TokenCardProps {
    token: Token_With_Metadata_And_Amount;
    deployBtnHandler: (token: Token_With_Metadata_And_Amount) => Promise<void>;
}
export default function TokenCard(prop: TokenCardProps) {
    const { handleInputChange, amount } = useTokenCard();
    return (
        <section className={styles.tokenCardContainer}>
            <img className={styles.tokenPhoto} src={getUrlForImage(prop.token.image)} alt={prop.token.TN_Hex} />
            <text className={styles.tokenName}>{hexToStr(prop.token.TN_Hex)}</text>
            <text className={styles.tokenAmount}>{prop.token.amount.toString()}</text>
            <div className={styles.separator} />
            <form className={styles.tokenAmountForm}>
                <text className={styles.tokenAmountCaption}>Amount:</text>
                <input className={styles.tokenAmountInput} onChange={(e) => handleInputChange(e)} type="number" name="amount" />
                <BlueButton
                    style={styles.deployButton}
                    onClick={() =>
                        console.log(
                            prop.deployBtnHandler({
                                ...prop.token,
                                amount: BigInt(amount),
                            })
                        )
                    }
                >
                    Create OTC
                </BlueButton>
            </form>
        </section>
    );
}
