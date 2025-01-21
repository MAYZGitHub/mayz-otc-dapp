// Claim.tsx
import { useClaim } from './useClaim';
import styles from './Claim.module.scss'
import SearchElement from './SearchElement/SearchElement';
import Otc from '@example/src/components/Common/Otc/Otc';
export default function Claim() {
    const { } = useClaim();

    return (
        <section className={styles.claimSection}>
            <SearchElement />
            <Otc />
        </section>
    );
}

