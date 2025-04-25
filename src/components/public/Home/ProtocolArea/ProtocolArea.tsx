// ProtocolArea.tsx
import { TxEnums } from '@/utils/constants/on-chain';
import { isEmulator, isNullOrBlank } from 'smart-db';
import styles from './ProtocolArea.module.scss';
import LoaderButton from '@/components/Common/LoaderButton/LoaderButton';
import BlueButton from '@/components/Common/Buttons/BlueButton/BlueButton';
import { useProtocolArea } from './useProtocolArea';
import { TaskEnums } from '@/utils/constants/constants';

export default function ProtocolArea() {
    const {
        appState,
        appStore,
        pdAdmins,
        setPdAdmins,
        pdTokenAdminPolicy_CS,
        setPdTokenAdminPolicy_CS,
        pd_mayz_deposit_requirement,
        set_pd_mayz_deposit_requirement,
        error,
        handleCreateProtocol,
        handleDeployProtocol,
        handleSyncProtocol,
        handleAddTokens,
        handleDeleteProtocol,
        handleUpdateProtocol,
    } = useProtocolArea();
    //--------------------------------------
    return (
        <>
            <section className={styles.protocolAreaSection}>
                <div className={styles.form}>
                    {appState.protocol === undefined ? (
                        <BlueButton style={styles.btnAction} onClick={handleCreateProtocol}>
                            Create Protocol {appStore.isProcessingTask === true && appStore.processingTaskName === TaskEnums.CREATE_PROTOCOL && <LoaderButton />}
                        </BlueButton>
                    ) : appState.protocol._isDeployed === false ? (
                        <>
                            <div className={styles.formGroup}>
                                <label>Admin Payment Key Hashes</label>
                                <input value={pdAdmins} onChange={(e) => setPdAdmins(e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Admin Token Currency Symbol</label>
                                <input value={pdTokenAdminPolicy_CS} onChange={(e) => setPdTokenAdminPolicy_CS(e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="pd_mayz_deposit_requirement">Mayz Required for OTC:</label>
                                <input
                                    type="number"
                                    id="pd_mayz_deposit_requirement"
                                    name="pd_mayz_deposit_requirement"
                                    value={pd_mayz_deposit_requirement}
                                    onChange={(e) => set_pd_mayz_deposit_requirement(e.target.value)}
                                    min="0"
                                />
                            </div>
                            {!isNullOrBlank(error) && <div className={styles.errorMessage}>{error}</div>}
                            <BlueButton style={styles.btnAction} onClick={handleDeployProtocol}>
                                Deploy {appStore.isProcessingTx === true && appStore.processingTxName === TxEnums.PROTOCOL_DEPLOY && <LoaderButton />}
                            </BlueButton>
                            <BlueButton style={styles.btnAction} onClick={handleSyncProtocol}>
                                Sync {appStore.isProcessingTask === true && appStore.processingTaskName === TaskEnums.SYNC_PROTOCOL && <LoaderButton />}
                            </BlueButton>
                            {isEmulator && (
                                <BlueButton style={styles.btnAction} onClick={handleAddTokens}>
                                    [TEST] Add Tokens {appStore.isProcessingTask === true && appStore.processingTaskName === TaskEnums.ADD_TEST_TOKENS && <LoaderButton />}
                                </BlueButton>
                            )}
                            <BlueButton style={styles.btnAction} onClick={handleDeleteProtocol}>
                                Delete {appStore.isProcessingTask === true && appStore.processingTaskName === TaskEnums.DELETE_PROTOCOL && <LoaderButton />}
                            </BlueButton>
                        </>
                    ) : (
                        <>
                            <div className={styles.formGroup}>
                                <label>Admin Payment Key Hashes</label>
                                <input value={pdAdmins} onChange={(e) => setPdAdmins(e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Admin Token Currency Symbol</label>
                                <input value={pdTokenAdminPolicy_CS} onChange={(e) => setPdTokenAdminPolicy_CS(e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="pd_mayz_deposit_requirement">Mayz Required for OTC:</label>
                                <input
                                    type="number"
                                    id="pd_mayz_deposit_requirement"
                                    name="pd_mayz_deposit_requirement"
                                    value={pd_mayz_deposit_requirement}
                                    onChange={(e) => set_pd_mayz_deposit_requirement(e.target.value)}
                                    min="0"
                                />
                            </div>
                            {!isNullOrBlank(error) && <div className={styles.errorMessage}>{error}</div>}
                            <BlueButton style={styles.btnAction} onClick={handleUpdateProtocol}>
                                Update {appStore.isProcessingTx === true && appStore.processingTxName === TxEnums.PROTOCOL_UPDATE && <LoaderButton />}
                            </BlueButton>
                            <BlueButton style={styles.btnAction} onClick={handleSyncProtocol}>
                                {appStore.isProcessingTask === true && appStore.processingTaskName === TaskEnums.SYNC_PROTOCOL && <LoaderButton />}
                            </BlueButton>
                            {isEmulator && (
                                <BlueButton style={styles.btnAction} onClick={handleAddTokens}>
                                    [TEST] Add Tokens {appStore.isProcessingTask === true && appStore.processingTaskName === TaskEnums.ADD_TEST_TOKENS && <LoaderButton />}
                                </BlueButton>
                            )}
                        </>
                    )}
                </div>
            </section>
        </>
    );
}
