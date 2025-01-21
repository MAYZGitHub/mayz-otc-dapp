// Home.tsx
import { useSidebar } from './useSidebar';
import styles from './Sidebar.module.scss'
import SidebarContent from './SidebarContent/SidebarContent';
export default function Sidebar() {
  const { } = useSidebar();

  return (
    <aside className={styles.sideBarArea} >
      <div className={styles.sideBarBox}>
        <div className="margin: 0px;">
          <div className={styles.simplebarOffset}>
            <SidebarContent/>
            <div className={styles.simplebarPlaceholder}>
            </div>
          </div>
        </div>
      </div>
    </aside >
  );
}
