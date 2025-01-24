// ProtocolArea.tsx
import { useProtocolArea } from './useProtocolArea';
import styles from './ProtocolArea.module.scss'
import { useState } from 'react';

interface FormularioProps {
    onSubmit: (mayzMinimo: number) => void;
}

export default function ProtocolArea(onSubmit: any) {
    const {
        handleSubmit,
        error,
        mayzMinimo,
        setMayzMinimo
    } = useProtocolArea();



    return (
        <section className={styles.protocolAreaSection}>

            <form onSubmit={handleSubmit} className={styles.formulario}>
                <div className={styles.form_group}>
                    <label htmlFor="mayzMinimo">Mayz mínimo:</label>
                    <input
                        type="number"
                        id="mayzMinimo"
                        name="mayzMinimo"
                        value={mayzMinimo}
                        onChange={(e) => setMayzMinimo(e.target.value)}
                        min="0"
                    />
                    {error && (<div className={styles.error_message} >{error}</div>)}
                </div>
                <button type="submit">Enviar</button>
            </form>
        </section>
    );
}

