import { useSidebarContent } from './useSidebarContent';
import styles from './SidebarContent.module.scss';

export default function SidebarContent() {
    const { sidebarState, setSideBarState, isWalletConnected } = useSidebarContent();

    const svgIcon = (
        <svg width="24px" height="24px" viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg" fill="#000000">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    fill="#e6e9ec"
                    fillRule="evenodd"
                    d="M306.85084,260.853513 C306.94215,260.763222 307,260.638581 307,260.500923 L307,246.499077 C307,246.223683 306.776142,246 306.5,246 C306.231934,246 306,246.223444 306,246.499077 L306,260 L292.499077,260 C292.223683,260 292,260.223858 292,260.5 C292,260.768066 292.223444,261 292.499077,261 L306.500923,261 C306.638467,261 306.763112,260.94416 306.853432,260.853856 Z M304.85084,258.853513 C304.94215,258.763222 305,258.638581 305,258.500923 L305,244.499077 C305,244.223683 304.776142,244 304.5,244 C304.231934,244 304,244.223444 304,244.499077 L304,258 L290.499077,258 C290.223683,258 290,258.223858 290,258.5 C290,258.768066 290.223444,259 290.499077,259 L304.500923,259 C304.638467,259 304.763112,258.94416 304.853432,258.853856 Z M289,244.006845 C289,243.45078 289.449949,243 290.006845,243 L301.993155,243 C302.54922,243 303,243.449949 303,244.006845 L303,255.993155 C303,256.54922 302.550051,257 301.993155,257 L290.006845,257 C289.45078,257 289,256.550051 289,255.993155 L289,244.006845 Z"
                    transform="translate(-289 -243)"
                ></path>
            </g>
        </svg>
    );

    return (
        <div className={styles.barContent}>
            <ul className={styles.navSection}>
                <div className={styles.sectionTitle}> Over The Counter </div>
                <li className={styles.sectionItem}>
                    <button
                        onClick={() => setSideBarState('Protocol Area')}
                        disabled={!isWalletConnected}
                        className={`${styles.sidebarItem} ${sidebarState == 'Protocol Area' && styles.activeLink}`}
                    >
                        <span className={styles.sidebarIcon}>{svgIcon}</span>
                        <span className="width: 100% !important;">
                            <div className={styles.sidebarText}>
                                <span>Protocol Area </span>
                            </div>
                        </span>
                    </button>
                </li>
                <li className={styles.sectionItem}>
                    <button
                        onClick={() => setSideBarState('Claim')}
                        disabled={!isWalletConnected}
                        className={`${styles.sidebarItem} ${sidebarState == 'Claim' && styles.activeLink}`}
                    >
                        <span className={styles.sidebarIcon}>{svgIcon}</span>
                        <span className="width: 100% !important;">
                            <div className={styles.sidebarText}>
                                <span>Claim </span>
                            </div>
                        </span>
                    </button>
                </li>
                <li className={styles.sectionItem}>
                    <button
                        onClick={() => setSideBarState('My Area')}
                        disabled={!isWalletConnected}
                        className={`${styles.sidebarItem} ${sidebarState == 'My Area' && styles.activeLink}`}
                    >
                        <span className={styles.sidebarIcon}>{svgIcon}</span>
                        <span className="width: 100% !important;">
                            <div className={styles.sidebarText}>
                                <span>My Area </span>
                            </div>
                        </span>
                    </button>
                </li>
            </ul>
        </div>
    );
}
