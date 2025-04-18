// ProtocolArea.tsx
import { AppStateContext } from '@/contexts/AppState';
import { OTCEntity, ProtocolEntity } from '@/lib/SmartDB/Entities';
import { ProtocolApi } from '@/lib/SmartDB/FrontEnd';
import {
    ADMIN_TOKEN_POLICY_CS,
    MAYZ_CS,
    MAYZ_TN_Str,
    OTC_ID_TN_Str,
    OTC_NFT_POLICY_PRE_CBORHEX,
    OTC_SCRIPT_PRE_CBORHEX,
    PROTOCOL_ID_TN_Str,
    PROTOCOL_SCRIPT_PRE_CBORHEX,
    ProtocolDeployTxParams,
    ProtocolUpdateTxParams,
    TEST_TOKEN_POLICY_CS,
    TEST_TOKEN_TN_Str,
    TxEnums,
} from '@/utils/constants/on-chain';
import { applyParamsToScript, Assets, Constr, Data, mintingPolicyToId, Script, UTxO, validatorToAddress, validatorToScriptHash } from '@lucid-evolution/lucid';
import { useContext, useEffect, useState } from 'react';
import {
    addAssets,
    BaseSmartDBFrontEndBtnHandlers,
    formatUTxO,
    LUCID_NETWORK_MAINNET_NAME,
    LUCID_NETWORK_PREVIEW_NAME,
    LucidToolsFrontEnd,
    PROYECT_NAME,
    pushSucessNotification,
    pushWarningNotification,
    showData,
    strToHex,
    useTransactions,
    useWalletStore,
    isEmulator,
    isNullOrBlank,
} from 'smart-db';
import styles from './ProtocolArea.module.scss';
import { useModal } from '@/contexts/ModalContext';
import { ModalsEnums, TaskEnums } from '@/utils/constants/constants';
import LoaderButton from '@/components/Common/LoaderButton/LoaderButton';
import BlueButton from '@/components/Common/Buttons/BlueButton/BlueButton';

export default function ProtocolArea() {
    //-------------------------
    const walletStore = useWalletStore();
    const { appState, setAppState } = useContext(AppStateContext);
    //-------------------------
    const [pdAdmins, setPdAdmins] = useState(appState.protocol?.pd_admins?.join(',') || '');
    const [pdTokenAdminPolicy_CS, setPdTokenAdminPolicy_CS] = useState(appState.protocol?.pd_mayz_policy_id ?? ADMIN_TOKEN_POLICY_CS);
    const [pd_mayz_deposit_requirement, set_pd_mayz_deposit_requirement] = useState(appState.protocol?.pd_mayz_deposit_requirement?.toString() ?? '');
    //-------------------------
    const [error, setError] = useState<string | null>(null);
    //-------------------------
    const { openModal } = useModal();
    //-------------------------
    useEffect(() => {
        if (walletStore.isConnected === true && walletStore.info !== undefined) {
            if (pdAdmins === '') {
                setPdAdmins(walletStore.info.pkh);
            }
        }
    }, [walletStore.isConnected]);
    //-------------------------
    useEffect(() => {
        if (appState.protocol !== undefined) {
            if (walletStore.isConnected === true && walletStore.info !== undefined) {
                if (pdAdmins === '') {
                    setPdAdmins(walletStore.info.pkh);
                }
            } else {
                setPdAdmins(appState.protocol?.pd_admins?.join(',') || '');
            }
            setPdTokenAdminPolicy_CS(appState.protocol?.pd_mayz_policy_id ?? ADMIN_TOKEN_POLICY_CS);
            set_pd_mayz_deposit_requirement(appState.protocol?.pd_mayz_deposit_requirement?.toString() ?? '');
        }
    }, [appState.protocol]);
    //-------------------------
    const fetchProtocol = async () => {
        // Example: fetch your protocol entity from SmartDB
        const protocol: ProtocolEntity | undefined = await ProtocolApi.getOneByParamsApi_(); // You must define this function
        // Update the context
        setAppState((prev) => ({ ...prev, protocol }));
    };
    //-------------------------
    const resetForm = async () => {
        setError(null);
    };
    const onTx = async () => {
        await fetchProtocol();
    };
    //--------------------------------------
    async function checkIsValidTx() {
        const isValid = true;
        return isValid;
    }
    //--------------------------------------
    const dependenciesValidTx: any[] = [];
    //--------------------------------------
    const {
        appStore,
        tokensStore,
        session,
        status,
        showUserConfirmation,
        setShowUserConfirmation,
        showProcessingTx,
        setShowProcessingTx,
        isProcessingTx,
        setIsProcessingTx,
        isFaildedTx,
        setIsFaildedTx,
        isConfirmedTx,
        setIsConfirmedTx,
        processingTxMessage,
        setProcessingTxMessage,
        processingTxHash,
        setProcessingTxHash,
        isValidTx,
        setIsValidTx,
        tokensGiveWithMetadata,
        setTokensGiveWithMetadata,
        tokensGetWithMetadata,
        setTokensGetWithMetadata,
        available_ADA_in_Wallet,
        available_forSpend_ADA_in_Wallet,
        isMaxAmountLoaded: isMaxAmountLoadedFromTxHook,
        handleBtnShowUserConfirmation,
        handleBtnDoTransaction_WithErrorControl,
    } = useTransactions({ dependenciesValidTx, checkIsValidTx, onTx, resetForm });
    //--------------------------------------
    const handleCreateProtocol = async () => {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TX);
            return;
        }
        if (appStore.isProcessingTask === true) {
            openModal(ModalsEnums.PROCESSING_TASK);
            return;
        }
        if (confirm('Are you sure you want to create the protocol?')) {
            //--------------------------------------
            appStore.setProcessingTaskName(TaskEnums.CREATE_PROTOCOL);
            appStore.setIsProcessingTask(true);
            appStore.setIsConfirmedTask(false);
            appStore.setIsFaildedTask(false);
            //--------------------------------------
            appStore.setProcessingTaskMessage('Creating Protocol...');
            openModal(ModalsEnums.PROCESSING_TASK);
            //--------------------------------------
            const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
            try {
                //--------------------------------------
                const walletUTxOs = walletTxParams.utxos;
                if (walletUTxOs.length === 0) {
                    throw 'You need at least one utxo to be used to mint Protocol ID';
                }
                const uTxO = walletUTxOs[0];
                console.log(`uTxO for creating Protocol ID: ${formatUTxO(uTxO.txHash, uTxO.outputIndex)}`);
                //--------------------------------------
                const pp_protocol_TxHash = uTxO.txHash;
                const pp_protocol_TxOutputIndex = uTxO.outputIndex;
                //--------------------------------------
                // Protocol Script
                //--------------------------------------
                const oRef = new Constr(0, [pp_protocol_TxHash, BigInt(pp_protocol_TxOutputIndex)]);
                const protocolParams = new Constr(0, [oRef, strToHex(PROTOCOL_ID_TN_Str)]);
                const fProtocolScript_Params = {
                    pp_protocol_policy_id_tx_out_ref: { txid: pp_protocol_TxHash, tx_index: pp_protocol_TxOutputIndex },
                    pp_protocol_id_tn: strToHex(PROTOCOL_ID_TN_Str),
                };
                const fProtocolScript: Script = {
                    type: 'PlutusV3',
                    script: applyParamsToScript(PROTOCOL_SCRIPT_PRE_CBORHEX, [protocolParams]),
                };
                //--------------------------------------
                const fProtocolPolicyID_CS = mintingPolicyToId(fProtocolScript);
                console.log(`fProtocolPolicyID_CS ${fProtocolPolicyID_CS}`);
                //--------------------------------------
                const fProtocolValidator_Hash = validatorToScriptHash(fProtocolScript);
                console.log(`fProtocolValidator_Hash ${fProtocolValidator_Hash}`);
                //--------------------------------------
                const fProtocolValidator_AddressTestnet = validatorToAddress(LUCID_NETWORK_PREVIEW_NAME, fProtocolScript);
                console.log(`fProtocolValidator_AddressTestnet ${fProtocolValidator_AddressTestnet}`);
                const fProtocolValidator_AddressMainnet = validatorToAddress(LUCID_NETWORK_MAINNET_NAME, fProtocolScript);
                console.log(`fProtocolValidator_AddressMainnet ${fProtocolValidator_AddressMainnet}`);
                //--------------------------------------
                // OTC Script
                //--------------------------------------
                // Convertir los strings a representación de bytes correcta
                // Parámetros para el validator OTC
                //--------------------------------------
                const otcParams = new Constr(0, [fProtocolPolicyID_CS, strToHex(PROTOCOL_ID_TN_Str), strToHex(OTC_ID_TN_Str)]);
                //--------------------------------------
                const fOTCScript_Params = {
                    pp_protocol_policy_id: fProtocolPolicyID_CS,
                    pp_protocol_id_tn: strToHex(PROTOCOL_ID_TN_Str),
                    pp_otc_id_tn: strToHex(OTC_ID_TN_Str),
                };
                //--------------------------------------
                const fOTCScript: Script = {
                    type: 'PlutusV3',
                    script: applyParamsToScript(OTC_SCRIPT_PRE_CBORHEX, [otcParams]),
                };
                //--------------------------------------
                const fOTCPolicyID_CS = mintingPolicyToId(fOTCScript);
                console.log(`fOTCPolicyID_CS ${fOTCPolicyID_CS}`);
                //--------------------------------------
                const fOTCValidator_Hash = validatorToScriptHash(fOTCScript);
                console.log(`fOTCValidator_Hash ${fOTCValidator_Hash}`);
                //--------------------------------------
                const fOTCValidator_AddressTestnet = validatorToAddress(LUCID_NETWORK_PREVIEW_NAME, fOTCScript);
                console.log(`fOTCValidator_AddressTestnet ${fOTCValidator_AddressTestnet}`);
                const fOTCValidator_AddressMainnet = validatorToAddress(LUCID_NETWORK_MAINNET_NAME, fOTCScript);
                console.log(`fOTCValidator_AddressMainnet ${fOTCValidator_AddressMainnet}`);
                //--------------------------------------
                const fOTC_NFT_PRE_Script: Script = {
                    type: 'PlutusV3',
                    script: OTC_NFT_POLICY_PRE_CBORHEX,
                };
                //--------------------------------------
                const protocol: ProtocolEntity = new ProtocolEntity({
                    name: PROYECT_NAME,
                    fProtocolScript,
                    fProtocolScript_Params,
                    fProtocolPolicyID_CS,
                    fProtocolValidator_AddressMainnet,
                    fProtocolValidator_AddressTestnet,
                    fProtocolValidator_Hash,
                    fOTCScript,
                    fOTCScript_Params,
                    fOTCPolicyID_CS,
                    fOTCValidator_AddressMainnet,
                    fOTCValidator_AddressTestnet,
                    fOTCValidator_Hash,
                    fOTC_NFT_PRE_Script,
                    _isDeployed: false,
                });
                //--------------------------------------
                const protocol_ = await ProtocolApi.createApi(protocol);
                //--------------------------------------
                await ProtocolApi.createHookApi(ProtocolEntity, protocol.getNet_Address(), protocol_.fProtocolPolicyID_CS);
                await ProtocolApi.createHookApi(OTCEntity, protocol.getOTC_Net_Address(), protocol_.fOTCPolicyID_CS);
                //--------------------------------------
                // Update the context
                setAppState((prev) => ({ ...prev, protocol: protocol_ }));
                //--------------------------------------
                pushSucessNotification(`${PROYECT_NAME}`, `Protocol created successfully`, false);
                //--------------------------------------
                appStore.setIsConfirmedTask(true);
                //--------------------------------------
                return protocol_._DB_id;
            } catch (error) {
                console.log(`[${PROYECT_NAME}] - handleBtnProtocolCreate - Error: ${error}`);
                pushWarningNotification(`${PROYECT_NAME}`, `Error creating Protocol: ${error}`);
                appStore.setIsFaildedTask(true);
                return undefined;
            } finally {
                appStore.setIsProcessingTask(false);
                appStore.setProcessingTaskMessage('');
            }
        }
    };
    //-------------------------
    const handleDeleteProtocol = async () => {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TX);
            return;
        }
        if (appStore.isProcessingTask === true) {
            openModal(ModalsEnums.PROCESSING_TASK);
            return;
        }
        if (confirm('Are you sure you want to delete the protocol?')) {
            //--------------------------------------
            appStore.setProcessingTaskName(TaskEnums.DELETE_PROTOCOL);
            appStore.setIsProcessingTask(true);
            appStore.setIsConfirmedTask(false);
            appStore.setIsFaildedTask(false);
            //--------------------------------------
            appStore.setProcessingTaskMessage('Deleting Protocol...');
            openModal(ModalsEnums.PROCESSING_TASK);
            //--------------------------------------
            try {
                await ProtocolApi.deleteByIdApi_(appState.protocol!._DB_id);
                //--------------------------------------
                pushSucessNotification(`${PROYECT_NAME}`, `Protocol deleted successfully`, false);
                //--------------------------------------
                await fetchProtocol();
                //--------------------------------------
                appStore.setIsConfirmedTask(true);
                //--------------------------------------
                return;
            } catch (error) {
                console.log(`[${PROYECT_NAME}] - handleDeleteProtocol - Error: ${error}`);
                pushWarningNotification(`${PROYECT_NAME}`, `Error deleting Protocol: ${error}`);
                appStore.setIsFaildedTask(true);
                return undefined;
            } finally {
                appStore.setIsProcessingTask(false);
                appStore.setProcessingTaskMessage('');
            }
        }
    };
    //-------------------------
    const handleAddTokens = async () => {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TX);
            return;
        }
        if (appStore.isProcessingTask === true) {
            openModal(ModalsEnums.PROCESSING_TASK);
            return;
        }
        if (confirm('Are you sure you want to Add Tokens?')) {
            //--------------------------------------
            appStore.setProcessingTaskName(TaskEnums.ADD_TEST_TOKENS);
            appStore.setIsProcessingTask(true);
            appStore.setIsConfirmedTask(false);
            appStore.setIsFaildedTask(false);
            //--------------------------------------
            appStore.setProcessingTaskMessage('Adding Tokens...');
            openModal(ModalsEnums.PROCESSING_TASK);
            //--------------------------------------
            const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
            try {
                //--------------------------------------
                //--------------------------------------
                const walletUTxOs = walletTxParams.utxos;

                if (walletUTxOs.length === 0) {
                    throw 'You need at least one utxo to add tokens';
                }
                const uTxO = walletUTxOs[0];

                //--------------------------------------
                const valueTokens1: Assets = { [TEST_TOKEN_POLICY_CS + strToHex(TEST_TOKEN_TN_Str)]: BigInt(100) };
                const valueTokenMAYZ: Assets = { [appState.protocol!.pd_mayz_policy_id + appState.protocol!.pd_mayz_tn]: BigInt(100) };
                console.log(uTxO)

                const valueTokens = addAssets(valueTokens1, valueTokenMAYZ);
                //--------------------------------------
                console.log(`[User] - Get Tokens Tx - valueTokens: ${showData(valueTokens)}`);
                //--------------------------------------
                const assets: Assets = ((lucid.config().provider as any).ledger[uTxO.txHash + uTxO.outputIndex].utxo as UTxO).assets as Assets;
                ((lucid.config().provider as any).ledger[uTxO.txHash + uTxO.outputIndex].utxo as UTxO).assets = addAssets(assets, valueTokens);
                //--------------------------------------
                if (isEmulator && emulatorDB !== undefined) {
                    // normalmente esto se hace en el submit, pero esta tx es mock y no hay submit
                    await LucidToolsFrontEnd.syncEmulatorAfterTx(lucid, emulatorDB);
                }
                //--------------------------------------
                await walletStore.loadWalletData();
                //--------------------------------------
                pushSucessNotification(`${PROYECT_NAME}`, `Added tokens successfully`, false);
                //--------------------------------------
                appStore.setIsConfirmedTask(true);
                //--------------------------------------
                return true;
            } catch (error) {
                console.log(`[${PROYECT_NAME}] - handleAddTokens - Error: ${error}`);
                pushWarningNotification(`${PROYECT_NAME}`, `Error Adding Tokens: ${error}`);
                appStore.setIsFaildedTask(true);
                return undefined;
            } finally {
                appStore.setIsProcessingTask(false);
                appStore.setProcessingTaskMessage('');
            }
        }
    };
    //-------------------------
    const handleDeployProtocol = async () => {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TX);
            return;
        }
        if (appStore.isProcessingTask === true) {
            openModal(ModalsEnums.PROCESSING_TASK);
            return;
        }
        if (pdAdmins.length === 0) {
            setError('Please enter a valid Admin Payment Key Hashes.');
            return;
        }
        if (isNullOrBlank(pdTokenAdminPolicy_CS)) {
            setError('Please enter a valid Admin Token Currency Symbol.');
        }
        if (!pd_mayz_deposit_requirement) {
            setError('Please enter a value.');
            return;
        }
        const pd_mayz_deposit_requirementNumber = Number(pd_mayz_deposit_requirement);
        if (isNaN(pd_mayz_deposit_requirementNumber)) {
            setError('Please enter a valid number.');
            return;
        }
        if (pd_mayz_deposit_requirementNumber < 0) {
            setError('Please enter a positive number.');
            return;
        }
        //--------------------------------------
        const fetchParams = async () => {
            //--------------------------------------
            const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
            //--------------------------------------
            const txParams: ProtocolDeployTxParams = {
                protocol_id: appState.protocol!._DB_id!,
                pd_admins: pdAdmins !== undefined && pdAdmins !== '' ? pdAdmins.split(',').map((admin) => admin.trim()) : [],
                pd_token_admin_policy_id: pdTokenAdminPolicy_CS,
                pd_mayz_policy_id: MAYZ_CS,
                pd_mayz_tn: strToHex(MAYZ_TN_Str),
                pd_mayz_deposit_requirement: BigInt(pd_mayz_deposit_requirement),
            };
            return {
                lucid,
                emulatorDB,
                walletTxParams,
                txParams,
            };
        };
        //--------------------------------------
        openModal(ModalsEnums.PROCESSING_TX);
        //--------------------------------------
        const txApiCall = ProtocolApi.callGenericTxApi.bind(ProtocolApi);
        const handleBtnTx = BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransaction_V2_NoErrorControl.bind(BaseSmartDBFrontEndBtnHandlers);
        //--------------------------------------
        await handleBtnDoTransaction_WithErrorControl(ProtocolEntity, TxEnums.PROTOCOL_DEPLOY, 'Deploying Protocol...', 'deploy-tx', fetchParams, txApiCall, handleBtnTx);
        //--------------------------------------
        await fetchProtocol();
    };
    //-------------------------
    const handleUpdateProtocol = async () => {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TX);
            return;
        }
        if (appStore.isProcessingTask === true) {
            openModal(ModalsEnums.PROCESSING_TASK);
            return;
        }
        if (pdAdmins.length === 0) {
            setError('Please enter a valid Admin Payment Key Hashes.');
            return;
        }
        if (isNullOrBlank(pdTokenAdminPolicy_CS)) {
            setError('Please enter a valid Admin Token Currency Symbol.');
        }
        if (!pd_mayz_deposit_requirement) {
            setError('Please enter a value.');
            return;
        }
        const pd_mayz_deposit_requirementNumber = Number(pd_mayz_deposit_requirement);
        if (isNaN(pd_mayz_deposit_requirementNumber)) {
            setError('Please enter a valid number.');
            return;
        }
        if (pd_mayz_deposit_requirementNumber < 0) {
            setError('Please enter a positive number.');
            return;
        }
        //--------------------------------------
        const fetchParams = async () => {
            //--------------------------------------
            const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
            //--------------------------------------
            const txParams: ProtocolUpdateTxParams = {
                protocol_id: appState.protocol!._DB_id!,
                pd_admins: pdAdmins !== undefined && pdAdmins !== '' ? pdAdmins.split(',').map((admin) => admin.trim()) : [],
                pd_token_admin_policy_id: pdTokenAdminPolicy_CS,
                pd_mayz_policy_id: MAYZ_CS,
                pd_mayz_tn: strToHex(MAYZ_TN_Str),
                pd_mayz_deposit_requirement: BigInt(pd_mayz_deposit_requirement),
            };
            return {
                lucid,
                emulatorDB,
                walletTxParams,
                txParams,
            };
        };
        //--------------------------------------
        openModal(ModalsEnums.PROCESSING_TX);
        //--------------------------------------
        const txApiCall = ProtocolApi.callGenericTxApi.bind(ProtocolApi);
        const handleBtnTx = BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransaction_V2_NoErrorControl.bind(BaseSmartDBFrontEndBtnHandlers);
        //--------------------------------------
        await handleBtnDoTransaction_WithErrorControl(ProtocolEntity, TxEnums.PROTOCOL_UPDATE, 'Updating Protocol...', 'update-tx', fetchParams, txApiCall, handleBtnTx);
        //--------------------------------------
    };
    //--------------------------------------
    const handleSyncProtocol = async () => {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TX);
            return;
        }
        if (appStore.isProcessingTask === true) {
            openModal(ModalsEnums.PROCESSING_TASK);
            return;
        }
        if (confirm('Are you sure you want to sync the protocol?')) {
            //--------------------------------------
            appStore.setProcessingTaskName(TaskEnums.SYNC_PROTOCOL);
            appStore.setIsProcessingTask(true);
            appStore.setIsConfirmedTask(false);
            appStore.setIsFaildedTask(false);
            //--------------------------------------
            appStore.setProcessingTaskMessage('Syncing Protocol...');
            openModal(ModalsEnums.PROCESSING_TASK);
            //--------------------------------------
            try {
                //--------------------------------------
                await ProtocolApi.syncWithAddressApi_(appState.protocol!.getNet_Address(), appState.protocol!.getNET_id_CS(), true);
                await ProtocolApi.syncWithAddressApi_(appState.protocol!.getOTC_Net_Address(), appState.protocol!.getOTC_NET_id_CS(), true);
                //--------------------------------------
                await fetchProtocol();
                //--------------------------------------
                pushSucessNotification(`${PROYECT_NAME}`, `Protocol synced successfully`, false);
                //--------------------------------------
                appStore.setIsConfirmedTask(true);
                //--------------------------------------
                return true;
            } catch (error) {
                console.log(`[${PROYECT_NAME}] - handleSyncProtocol - Error: ${error}`);
                pushWarningNotification(`${PROYECT_NAME}`, `Error syncing Protocol: ${error}`);
                appStore.setIsFaildedTask(true);
                return undefined;
            } finally {
                appStore.setIsProcessingTask(false);
                appStore.setProcessingTaskMessage('');
            }
        }
    };
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
                                Sync {appStore.isProcessingTask === true && appStore.processingTaskName === TaskEnums.SYNC_PROTOCOL && <LoaderButton />}
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
