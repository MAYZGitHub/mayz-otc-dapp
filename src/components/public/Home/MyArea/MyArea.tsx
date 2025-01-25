// MyArea.tsx
import { useMyArea } from './useMyArea';
import styles from './MyArea.module.scss'

import messiImage from '@root/public/messi.jpg'
import Otc from '@/components/Common/Otc/Otc';
import YourTokenSeccion from './YourTokenSeccion/YourTokenSeccion';

export default function MyArea(props: any) {
    const { cancelBtnHandler,
        closeBtnHandler,
    } = useMyArea();

    console.log()


    const cancelBtn = (<button type='button' className={styles.cancel} onClick={cancelBtnHandler}>Cancel</button>)
    const closeBtn = (<button type='button' className={styles.close} onClick={closeBtnHandler}>Close</button>)


    const imagesProp = [{ srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 100000, btnMod: cancelBtn },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn }]

    return (
        <section className={styles.myAreaSection}>
            <YourTokenSeccion settersModalTx={props.settersModalTx} />
            <Otc seccionCaption="Your Open OTC" tokens={imagesProp} settersModalTx={props.settersModalTx} />
        </section>
    );
}

