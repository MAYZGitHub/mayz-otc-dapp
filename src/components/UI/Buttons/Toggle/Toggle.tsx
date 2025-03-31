import styles from './Toggle.module.scss';

interface ToggleProps {
    isActive: boolean;
    onClickToggle: () => void;
    disabled: boolean;
    transparent?: boolean;
}

export default function Toggle(props: ToggleProps) {
    const { isActive, onClickToggle, disabled, transparent } = props;

    const handleClickToggle = () => {
        if (!disabled) {
            onClickToggle();
        }
    };

    return (
        <div className={styles.toggleController}>
            <div className={`${styles.toggle} ${disabled ? styles.disabled : ''} ${transparent ? styles.transparent : ''}`} onClick={handleClickToggle}>
                <span className={`${styles.point} ${isActive ? styles.active : ''}`}></span>
            </div>
        </div>
    );
}