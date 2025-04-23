// Claim.tsx
import { useClaim, UseClaimProps } from './useClaim';
import styles from './Claim.module.scss';
import SearchElement from './SearchElement/SearchElement';
import Otc from '@/components/Common/Otc/Otc';

export default function Claim({ listOfOtcEntityWithTokens, walletTokens }: UseClaimProps) {
    const { handleInputChange, filteredItems } = useClaim({ listOfOtcEntityWithTokens, walletTokens });
    const itemsWithButtom = () => {
        const otcToClaimInterface = filteredItems;

        return otcToClaimInterface?.map((token) => {
            return {
                token: token.tokens,
                btnHandler: (
                    <button type="button" className={styles.claim} onClick={token.btnHandler}>
                        Claim
                    </button>
                ),
            };
        });
    };    

    return (
        <section className={styles.claimSection}>
            <SearchElement handleInputChange={handleInputChange} />
            <Otc seccionCaption="New's OTC" tokens={itemsWithButtom()} />
        </section>
    );
}
