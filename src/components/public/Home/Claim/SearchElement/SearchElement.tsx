// SearchElement.tsx
import { useSearchElement } from './useSearchElement';
import styles from './SearchElement.module.scss'
export default function SearchElement() {
    const { } = useSearchElement();

    const svgSearch = (
        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier"> <path d="M11 6C13.7614 6 16 8.23858 16 11M16.6588 16.6549L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#9FA1A7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            </path>
            </g>
        </svg>)

    return (
        <section className={styles.searchContainer}>
            <form className={styles.searchBox}>
                {svgSearch}
                <input className={styles.searchArea} type="text" onChange={() => { console.log("filtrito de busqueda") }} placeholder='Search by name or policy ID' />
            </form>
        </section>
    );
}

