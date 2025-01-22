// MyArea.tsx
import { useMyArea } from './useMyArea';
import styles from './MyArea.module.scss'

import messiImage from '@root/public/messi.jpg'
import Otc from '@/components/Common/Otc/Otc';
import YourTokenSeccion from './YourTokenSeccion/YourTokenSeccion';

export default function MyArea() {
    const { cancelBtnHandler,
        closeBtnHandler,
        deployBtnHandler,
        isLoading,
        isLoadingDetails,
        isLoadedDetails,
        current,
        isLoadingAnyTx,
        setIsLoadingAnyTx,
        tokenCardInterface
    } = useMyArea();

    console.log()


    const cancelBtn = (<button type='button' className={styles.cancel} onClick={cancelBtnHandler}>Cancel</button>)
    const closeBtn = (<button type='button' className={styles.close} onClick={closeBtnHandler}>Close</button>)


    const imagesProp = [{ srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn, btnHandler: deployBtnHandler },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 100000, btnMod: cancelBtn, btnHandler: deployBtnHandler },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn, btnHandler: deployBtnHandler },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn, btnHandler: deployBtnHandler },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn, btnHandler: deployBtnHandler },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn, btnHandler: deployBtnHandler },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn, btnHandler: deployBtnHandler },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn, btnHandler: deployBtnHandler },
    { srcImageToken: messiImage, photoAlt: 'MESSI', tokenName: 'MESSI', tokenAmount: 10, btnMod: closeBtn, btnHandler: deployBtnHandler }]

    return (
        <section className={styles.myAreaSection}>
            {isLoadedDetails && <YourTokenSeccion tokens={tokenCardInterface()} />}
            <Otc seccionCaption="Your Open OTC" tokens={imagesProp} />
        </section>
    );
}

