// ProtocolArea.tsx
import { AppStateContext } from '@/contexts/AppState';
import { OTCEntity, ProtocolEntity } from '@/lib/SmartDB/Entities';
import { ProtocolApi } from '@/lib/SmartDB/FrontEnd';
import {
    ADMIN_TOKEN_POLICY_CS,
    MAYZ_CS,
    MAYZ_TN,
    OTC_ID_TN,
    OTC_NFT_POLICY_PRE_CBORHEX,
    OTC_SCRIPT_PRE_CBORHEX,
    PROTOCOL_ID_TN,
    PROTOCOL_SCRIPT_PRE_CBORHEX,
    ProtocolDeployTxParams,
} from '@/utils/constants/on-chain';
import { applyParamsToScript, Constr, Data, mintingPolicyToId, Script, validatorToAddress, validatorToScriptHash } from '@lucid-evolution/lucid';
import { useContext } from 'react';
import {
    BaseSmartDBFrontEndBtnHandlers,
    formatUTxO,
    LUCID_NETWORK_MAINNET_NAME,
    LUCID_NETWORK_PREVIEW_NAME,
    LucidToolsFrontEnd,
    PROYECT_NAME,
    pushSucessNotification,
    pushWarningNotification,
    strToHex,
    useTransactions,
    useWalletStore,
} from 'smart-db';
import styles from './ProtocolArea.module.scss';
import { useProtocolArea } from './useProtocolArea';
import { useModal } from '@/contexts/ModalContext';
import { ModalsEnums } from '@/utils/constants/constants';
import LoaderButton from '@/components/Common/LoaderButton/LoaderButton';

interface FormularioProps {
    onSubmit: (pd_mayz_deposit_requirement: number) => void;
}

export default function ProtocolArea(onSubmit: any) {
    const { error, pd_mayz_deposit_requirement, set_pd_mayz_deposit_requirement, setError } = useProtocolArea();

    const walletStore = useWalletStore();
    const { appState, setAppState } = useContext(AppStateContext);
    const { openModal } = useModal();

    const handleCreateProtocol = async () => {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TASK);
            return;
        }

        if (confirm('Are you sure you want to create the protocol?')) {
            //--------------------------------------
            appStore.setIsProcessingTx(true);
            appStore.setIsConfirmedTx(false);
            appStore.setIsFaildedTx(false);
            //--------------------------------------
            appStore.setProcessingTxMessage('Creating Protocol...');
            openModal(ModalsEnums.PROCESSING_TASK);
            //--------------------------------------
            const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
            try {
                //--------------------------------------
                const lucid = await walletStore.getLucid();
                if (lucid === undefined) {
                    throw 'Please connect your wallet';
                }
                //--------------------------------------
                if (walletStore.isWalletDataLoaded !== true) {
                    throw 'Wallet Data is not ready';
                }
                if (walletStore.getUTxOsAtWallet().length === 0) {
                    throw 'You need at least one utxo to be used to mint Protocol ID';
                }
                //--------------------------------------
                const walletUTxOs = walletStore.getUTxOsAtWallet();
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
                const OutputRefSchema = Data.Tuple([Data.Bytes(), Data.Integer()], { hasConstr: true });
                const ParamsSchemaProtocolScript = Data.Tuple([OutputRefSchema, Data.Bytes()], { hasConstr: true });
                type ParamsProtocolScript = Data.Static<typeof ParamsSchemaProtocolScript>;
                //--------------------------------------
                // Para OutputReference
                const txOutRef = new Constr(0, [
                    pp_protocol_TxHash, // transaction_id como ByteArray
                    BigInt(pp_protocol_TxOutputIndex), // output_index como Int
                ]);
                // Convertir el string "ProtocolID" a bytes correctamente
                const tokenNameBytes = new TextEncoder().encode(PROTOCOL_ID_TN);
                // Conviértelo a formato hexadecimal si es necesario
                const protocolIdTokenName = Buffer.from(tokenNameBytes).toString('hex');
                // Parámetros completos para el validator
                const protocolParams = [
                    txOutRef, // Primera parte: OutputReference
                    protocolIdTokenName, // Segunda parte: ByteArray
                ];
                const fProtocolScript_Params = {
                    pp_protocol_txout_ref: {
                        pp_protocol_txid: pp_protocol_TxHash,
                        pp_protocol_txout_index: pp_protocol_TxOutputIndex,
                    },
                    pp_protocol_id_tn: strToHex(PROTOCOL_ID_TN),
                };
                //--------------------------------------
                // Aplicando los parámetros al script
                const fProtocolScript: Script = {
                    type: 'PlutusV3',
                    script: applyParamsToScript(
                        PROTOCOL_SCRIPT_PRE_CBORHEX,
                        protocolParams // Pasando el array de parámetros
                    ),
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
                const otcIdTokenNameBytes = new TextEncoder().encode(OTC_ID_TN);
                const otcIdTokenName = Buffer.from(otcIdTokenNameBytes).toString('hex');
                // Parámetros para el validator OTC
                const otcParams = [
                    fProtocolPolicyID_CS, // PolicyId del protocolo
                    protocolIdTokenName, // ByteArray para el token name del protocolo
                    otcIdTokenName, // ByteArray para el token name del OTC
                ];
                const fOTCScript_Params = {
                    pp_protocol_policy_id: fProtocolPolicyID_CS,
                    pp_protocol_id_tn: strToHex(PROTOCOL_ID_TN),
                    pp_otc_id_tn: strToHex(OTC_ID_TN),
                };
                //--------------------------------------
                const fOTCScript: Script = {
                    type: 'PlutusV3',
                    script: applyParamsToScript(OTC_SCRIPT_PRE_CBORHEX, otcParams),
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
                    fOTC_NFT_PRE_Script: OTC_NFT_POLICY_PRE_CBORHEX,
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
                appStore.setIsConfirmedTx(true);
                //--------------------------------------
                return protocol_._DB_id;
            } catch (error) {
                console.log(`[${PROYECT_NAME}] - handleBtnProtocolCreate - Error: ${error}`);
                pushWarningNotification(`${PROYECT_NAME}`, `Error creating protocol: ${error}`);
                appStore.setIsFaildedTx(true);
                return undefined;
            } finally {
                appStore.setIsProcessingTx(false);
                appStore.setProcessingTxMessage('');
            }
        }
    };

    const onTx = async () => {
        // fetch();
    };
    const onTryAgainTx = async () => {
        setIsFaildedTx(false);
        setIsFaildedTx(false);
        setShowProcessingTx(false);
    };
    const onFinishTx = async () => {
        // si la tx paso, ya se reseto el form en onTx, pero por las dudas, si aprienta cuando falla
        if (isFaildedTx === true) {
            // fetch();
        }
        setIsConfirmedTx(false);
        setIsFaildedTx(false);
        setShowProcessingTx(false);
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
    } = useTransactions({ dependenciesValidTx, checkIsValidTx, onTx });
    //--------------------------------------

    const handleDeployProtocol = async () => {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TX);
            return;
        }

        if (!pd_mayz_deposit_requirement) {
            setError('Por favor, ingresa un valor.');
            return;
        }

        const pd_mayz_deposit_requirementNumber = Number(pd_mayz_deposit_requirement);

        if (isNaN(pd_mayz_deposit_requirementNumber)) {
            setError('Por favor, ingresa un número válido');
            return;
        }

        if (pd_mayz_deposit_requirementNumber < 0) {
            setError('Por favor, ingresa un número positivo');
            return;
        }

        //--------------------------------------
        const fetchParams = async () => {
            //--------------------------------------
            const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
            //--------------------------------------
            const txParams: ProtocolDeployTxParams = {
                protocol_id: appState.protocol!._DB_id!,
                pd_admins: [],
                pd_token_admin_policy_id: ADMIN_TOKEN_POLICY_CS,
                pd_mayz_policy_id: MAYZ_CS,
                pd_mayz_tn: strToHex(MAYZ_TN),
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
        await handleBtnDoTransaction_WithErrorControl(ProtocolEntity, `Deploy Tx`, 'Deploying FT...', 'deploy-tx', fetchParams, txApiCall, handleBtnTx);
        //--------------------------------------

        setError(null);
        set_pd_mayz_deposit_requirement(''); // Limpia el input después del envío
    };

    return (
        <>
            {appState.protocol === undefined ? (
                <button className={styles.btnAction} onClick={handleCreateProtocol}>
                    Create Protocol {appStore.isProcessingTx === true && <LoaderButton />}
                </button>
            ) : appState.protocol._isDeployed === false ? (
                <section className={styles.protocolAreaSection}>
                    <div className={styles.formulario}>
                        <div className={styles.form_group}>
                            <label htmlFor="pd_mayz_deposit_requirement">Mayz mínimo:</label>
                            <input
                                type="number"
                                id="pd_mayz_deposit_requirement"
                                name="pd_mayz_deposit_requirement"
                                value={pd_mayz_deposit_requirement}
                                onChange={(e) => set_pd_mayz_deposit_requirement(e.target.value)}
                                min="0"
                            />
                        </div>
                        {error && <div className={styles.error_message}>{error}</div>}
                        <button className={styles.btnAction} onClick={handleDeployProtocol}>
                            Deploy {appStore.isProcessingTx === true && <LoaderButton />}
                        </button>
                    </div>
                </section>
            ) : (
                `Update Transaction `
            )}
        </>
    );
}
