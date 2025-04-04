import { PROTOCOL_CREATE, ProtocolDeployTxParams } from '@/utils/constants/on-chain';
import { Address, Assets, PaymentKeyHash, TxBuilder } from '@lucid-evolution/lucid';
import { NextApiResponse } from 'next';
import { TRANSACTION_STATUS_CREATED, TxOutRef, convertMillisToTime, find_TxOutRef_In_UTxOs, fixUTxOList, getTxRedeemersDetailsAndResources, toJson } from 'smart-db';
import {
    BackEndApiHandlersFor,
    BackEndAppliedFor,
    BaseSmartDBBackEndApiHandlers,
    BaseSmartDBBackEndApplied,
    BaseSmartDBBackEndMethods,
    LucidToolsBackEnd,
    NextApiRequestAuthenticated,
    TimeBackEnd,
    TransactionBackEndApplied,
    TransactionDatum,
    TransactionEntity,
    TransactionRedeemer,
    WalletTxParams,
    addAssetsList,
    calculateMinAdaOfUTxO,
    console_error,
    console_log,
    isEmulator,
    objToCborHex,
    sanitizeForDatabase,
    showData,
} from 'smart-db/backEnd';
import { ProtocolDatum, ProtocolEntity } from '../Entities/Protocol.Entity';
import { CreateProtocol } from '../Entities/Redeemers/Protocol.Redeemer';

@BackEndAppliedFor(ProtocolEntity)
export class ProtocolBackEndApplied extends BaseSmartDBBackEndApplied {
    protected static _Entity = ProtocolEntity;
    protected static _BackEndMethods = BaseSmartDBBackEndMethods;

    private static sortDatum(datum: ProtocolDatum) {
        datum.pd_admins = datum.pd_admins.sort((a: PaymentKeyHash, b: PaymentKeyHash) => {
            if (a < b) return -1;
            return 1;
        });
    }

    public static mkNew_ProtocolDatum(protocol: ProtocolEntity, txParams: ProtocolDeployTxParams, mindAda: bigint): ProtocolDatum {
        // usado para que los campos del datum tengan las clases y tipos bien
        // txParams trae los campos pero estan plain, no son clases ni tipos

        const datumPlainObject: ProtocolDatum = {
            pd_admins: txParams.pd_admins,
            pd_token_admin_policy_id: txParams.pd_token_admin_policy_id,
            pd_mayz_policy_id: txParams.pd_mayz_policy_id,
            pd_mayz_tn: txParams.pd_mayz_tn,
            pd_mayz_deposit_requirement: txParams.pd_mayz_deposit_requirement,
            pd_min_ada: mindAda,
        };

        let datum: ProtocolDatum = ProtocolEntity.mkDatumFromPlainObject(datumPlainObject) as ProtocolDatum;

        this.sortDatum(datum);

        return datum;
    }
}

@BackEndApiHandlersFor(ProtocolEntity)
export class ProtocolApiHandlers extends BaseSmartDBBackEndApiHandlers {
    protected static _Entity = ProtocolEntity;
    protected static _BackEndApplied = ProtocolBackEndApplied;
    
    // #region custom api handlers

    protected static _ApiHandlers: string[] = ['tx'];

    protected static async executeApiHandlers(command: string, req: NextApiRequestAuthenticated, res: NextApiResponse) {
        //--------------------
        const { query } = req.query;
        //--------------------
        if (this._ApiHandlers.includes(command) && query !== undefined) {
            if (query[0] === 'tx') {
                if (query.length === 2) {
                    if (query[1] === 'deploy-tx') {
                        return await this.protocolDeployTxApiHandler(req, res);
                    }
                    // else if (query[1] === 'update-params-tx') {
                    //     return await this.claimTxApiHandler(req, res);
                    // } else if (query[1] === 'update-min-ada-tx') {
                    //     return await this.updateTxApiHandler(req, res);
                    // }
                }
                return res.status(405).json({ error: 'Wrong Api route' });
            } else {
                console_error(0, this._Entity.className(), `executeApiHandlers - Error: Api Handler function not found`);
                return res.status(500).json({ error: 'Api Handler function not found ' });
            }
        } else {
            console_error(0, this._Entity.className(), `executeApiHandlers - Error: Wrong Custom Api route`);
            return res.status(405).json({ error: 'Wrong Custom Api route ' });
        }
    }

    // #endregion custom api handlers

    // #region transactions

    public static async protocolDeployTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
        //--------------------
        if (req.method === 'POST') {
            console_log(1, this._Entity.className(), `Deploy Tx - POST - Init`);
            try {
                //-------------------------
                const sanitizedBody = sanitizeForDatabase(req.body);
                //-------------------------
                const { walletTxParams, txParams }: { walletTxParams: WalletTxParams; txParams: ProtocolDeployTxParams } = sanitizedBody;
                //--------------------------------------
                console_log(0, this._Entity.className(), `Deploy Tx - txParams: ${showData(txParams)}`);
                //--------------------------------------
                if (isEmulator) {
                    // solo en emulator. Me aseguro de setear el emulador al tiempo real del server. Va a saltear los slots necesarios.
                    // await TimeBackEnd.syncBlockChainWithServerTime()
                }
                //--------------------------------------
                const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);
                //--------------------------------------
                walletTxParams.utxos = fixUTxOList(walletTxParams?.utxos ?? []);
                //--------------------------------------
                const protocol = await this._BackEndApplied.getById_<ProtocolEntity>(txParams.protocol_id, { fieldsForSelect: {} });
                if (protocol === undefined) {
                    throw `Invalid protocol id`;
                }
                //--------------------------------------
                const protocolPolicyID_Script = protocol.fProtocolScript;
                //--------------------------------------
                const protocolPolicyID_AC_Lucid = protocol.getNet_id_AC_Lucid();
                //--------------------------------------
                const protocolValidator_Address: Address = protocol.getNet_Address();
                //--------------------------------------
                const protocolID_TxOutRef = new TxOutRef(
                    (protocol.fProtocolScript_Params as any).pp_protocol_TxHash,
                    Number((protocol.fProtocolScript_Params as any).pp_protocol_TxOutputIndex)
                );
                //--------------------------------------
                const uTxOsAtWallet = walletTxParams.utxos; // await lucid.utxosAt(params.address);
                const protocolID_UTxO = find_TxOutRef_In_UTxOs(protocolID_TxOutRef, uTxOsAtWallet);
                if (protocolID_UTxO === undefined) {
                    throw "Can't find UTxO (" + toJson(protocolID_TxOutRef) + ') for Mint ProtocolID';
                }
                //--------------------------------------
                const valueFor_Mint_ProtocolID: Assets = { [protocolPolicyID_AC_Lucid]: 1n };
                console_log(0, this._Entity.className(), `Deploy Tx - valueFor_Mint_ProtocolID: ${showData(valueFor_Mint_ProtocolID)}`);
                //--------------------------------------
                const protocolDatum_Out_ForCalcMinADA = this._BackEndApplied.mkNew_ProtocolDatum(protocol, txParams, 0n);
                const protocolDatum_Out_Hex_ForCalcMinADA = ProtocolEntity.datumToCborHex(protocolDatum_Out_ForCalcMinADA);
                //--------------------------------------
                let valueFor_ProtocolDatum_Out: Assets = valueFor_Mint_ProtocolID;
                const minADA_For_ProtocolDatum = calculateMinAdaOfUTxO({ datum: protocolDatum_Out_Hex_ForCalcMinADA, assets: valueFor_ProtocolDatum_Out });
                const value_MinAda_For_ProtocolDatum: Assets = { lovelace: minADA_For_ProtocolDatum };
                valueFor_ProtocolDatum_Out = addAssetsList([value_MinAda_For_ProtocolDatum, valueFor_ProtocolDatum_Out]);
                console_log(0, this._Entity.className(), `Deploy Tx - valueFor_ProtocolDatum_Out: ${showData(valueFor_ProtocolDatum_Out, false)}`);
                //--------------------------------------
                const protocolDatum_Out = this._BackEndApplied.mkNew_ProtocolDatum(protocol, txParams, minADA_For_ProtocolDatum);
                console_log(0, this._Entity.className(), `Deploy Tx - protocolDatum_Out: ${showData(protocolDatum_Out, false)}`);
                const protocolDatum_Out_Hex = ProtocolEntity.datumToCborHex(protocolDatum_Out);
                console_log(0, this._Entity.className(), `Deploy Tx - protocolDatum_Out_Hex: ${showData(protocolDatum_Out_Hex, false)}`);
                //--------------------------------------
                const createProtocol = new CreateProtocol();
                console_log(0, this._Entity.className(), `Deploy Tx - createProtocol: ${showData(createProtocol, false)}`);
                const createProtocol_Hex = objToCborHex(createProtocol);
                console_log(0, this._Entity.className(), `Deploy Tx - createProtocol_Hex: ${showData(createProtocol_Hex, false)}`);
                //--------------------------------------
                let { from, until } = await TimeBackEnd.getTxTimeRange();
                //--------------------------------------
                const flomSlot = lucid.unixTimeToSlot(from);
                const untilSlot = lucid.unixTimeToSlot(until);
                //--------------------------------------
                if (flomSlot < 0) {
                    from = until - 1000 * 10;
                }
                //--------------------------------------
                console_log(
                    0,
                    this._Entity.className(),
                    `Deploy Tx - currentSlot: ${lucid.currentSlot()} - from ${from} to ${until} - from ${convertMillisToTime(from)} to ${convertMillisToTime(
                        until
                    )} - fromSlot ${flomSlot} to ${untilSlot}`
                );
                //--------------------------------------
                let transaction: TransactionEntity | undefined = undefined;
                //--------------------------------------
                try {
                    const transaction_ = new TransactionEntity({
                        paymentPKH: walletTxParams.pkh,
                        date: new Date(from),
                        type: PROTOCOL_CREATE,
                        status: TRANSACTION_STATUS_CREATED,
                        reading_UTxOs: [],
                        consuming_UTxOs: [],
                        valid_from: from,
                        valid_until: until,
                    });
                    //--------------------------------------
                    transaction = await TransactionBackEndApplied.create(transaction_);
                    //--------------------------------------
                    let tx: TxBuilder = lucid.newTx();
                    //--------------------------------------
                    tx = tx
                        .collectFrom([protocolID_UTxO])
                        .attach.MintingPolicy(protocolPolicyID_Script)
                        .mintAssets(valueFor_Mint_ProtocolID, createProtocol_Hex)
                        .pay.ToAddressWithData(protocolValidator_Address, { kind: 'inline', value: protocolDatum_Out_Hex }, valueFor_ProtocolDatum_Out)
                        .addSigner(walletTxParams.address)
                        .validFrom(from)
                        .validTo(until);
                    //--------------------------------------
                    const txComplete = await tx.complete();
                    //--------------------------------------
                    const txCborHex = txComplete.toCBOR();
                    //--------------------------------------
                    const txHash = txComplete.toHash();
                    //--------------------------------------
                    const resources = getTxRedeemersDetailsAndResources(txComplete);
                    //--------------------------------------
                    console_log(0, this._Entity.className(), `Deploy Tx - Tx Resources: ${showData({ redeemers: resources.redeemersLogs, tx: resources.tx })}`);
                    //--------------------------------------
                    const transactionCreateProtocol: TransactionRedeemer = {
                        tx_index: 0,
                        purpose: 'mint',
                        redeemerObj: createProtocol,
                        unit_mem: resources.redeemers[0]?.MEM,
                        unit_steps: resources.redeemers[0]?.CPU,
                    };
                    const transactionProtocolDatum_Out: TransactionDatum = {
                        address: protocolValidator_Address,
                        datumType: ProtocolEntity.className(),
                        datumObj: protocolDatum_Out,
                    };
                    //--------------------------------------
                    await TransactionBackEndApplied.setPendingTransaction(transaction, {
                        hash: txHash,
                        ids: { protocol_id: protocol._DB_id },
                        redeemers: { createProtocol: transactionCreateProtocol },
                        datums: { protocolDatum_Out: transactionProtocolDatum_Out },
                        reading_UTxOs: [],
                        consuming_UTxOs: [protocolID_UTxO],
                        unit_mem: resources.tx[0]?.MEM,
                        unit_steps: resources.tx[0]?.CPU,
                        fee: resources.tx[0]?.FEE,
                        size: resources.tx[0]?.SIZE,
                        CBORHex: txCborHex,
                    });
                    //--------------------------------------
                    console_log(-1, this._Entity.className(), `Deploy Tx - txCborHex: ${showData(txCborHex)}`);
                    return res.status(200).json({ txHash, txCborHex });
                } catch (error) {
                    if (transaction !== undefined) {
                        await TransactionBackEndApplied.setFailedTransaction(transaction, { error, walletInfo: walletTxParams, txInfo: txParams });
                    }
                    throw error;
                }
            } catch (error) {
                console_error(-1, this._Entity.className(), `Deploy Tx - Error: ${error}`);
                return res.status(500).json({ error: `An error occurred while creating the ${this._Entity.className()} Deploy Tx: ${error}` });
            }
        } else {
            console_error(-1, this._Entity.className(), `Deploy Tx - Error: Method not allowed`);
            return res.status(405).json({ error: `Method not allowed` });
        }
    }

    // #endregion transactions
}
