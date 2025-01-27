import { NextApiResponse } from 'next';
import {
    BackEndApiHandlersFor,
    BackEndAppliedFor,
    BaseSmartDBBackEndApiHandlers,
    BaseSmartDBBackEndApplied,
    BaseSmartDBBackEndMethods,
    LucidToolsBackEnd,
    NextApiRequestAuthenticated,
    TRANSACTION_STATUS_PENDING,
    TimeBackEnd,
    TransactionBackEndApplied,
    TransactionDatum,
    TransactionEntity,
    TransactionRedeemer,
    WalletTxParams,
    addAssetsList,
    addressToPubKeyHash,
    calculateMinAdaOfUTxO,
    console_error,
    console_log,
    isEmulator,
    objToCborHex,
    sanitizeForDatabase,
    showData,
    strToHex,
} from 'smart-db/backEnd';
import { ProtocolAdminEntity } from '../Entities/ProtocolAdmin.Entity';
import { convertLucidAssetsToMesh, getScript, getTxBuilder } from '../../Commons/meshCommons';
import { mayzPolicyId, mayzTn, protocolAdminPreScriptCBORHEX, protocolIdTn } from '../../Commons/Constants/onchain';
import { BlockfrostProvider, currencySymbol, list, MeshWallet, resolveScriptHash } from '@meshsdk/core';
import { Assets } from 'lucid-cardano';
import { CreateProtocol } from '../Entities/Redeemers/ProtocolAdmin.Redeemer';
import { CreateProtocolTxParams, PROTOCOL_CREATE } from '../../Commons/Constants/transactions';
import { LocalProtocolAdminEntity } from '../Entities';
import { LocalProtocolAdminBackEndApplied } from './LocalProtocolAdmin.BackEnd.Api.Handlers';
import { useWalletStore } from 'smart-db';

@BackEndAppliedFor(ProtocolAdminEntity)
export class ProtocolAdminBackEndApplied extends BaseSmartDBBackEndApplied {
    protected static _Entity = ProtocolAdminEntity;
    protected static _BackEndMethods = BaseSmartDBBackEndMethods;
}

@BackEndApiHandlersFor(ProtocolAdminEntity)
export class ProtocolAdminApiHandlers extends BaseSmartDBBackEndApiHandlers {
    protected static _Entity = ProtocolAdminEntity;
    protected static _BackEndApplied = ProtocolAdminBackEndApplied;
    // #region custom api handlers

    protected static _ApiHandlers: string[] = ['tx'];

    protected static async executeApiHandlers(command: string, req: NextApiRequestAuthenticated, res: NextApiResponse) {
        //--------------------
        const { query } = req.query;
        //--------------------
        if (this._ApiHandlers.includes(command) && query !== undefined) {
            if (query[0] === 'tx') {
                if (query.length === 2) {
                    if (query[1] === 'create-protocol-tx') {
                        return await this.createProtocolTxApiHandler(req, res);
                    }// else if (query[1] === 'update-params-tx') {
                    //     return await this.claimTxApiHandler(req, res);
                    // } else if (query[1] === 'update-min-ada-tx') {
                    //     return await this.updateTxApiHandler(req, res);
                    // }
                }
                return res.status(405).json({ error: "Wrong Api route" });
            } else {
                console_error(0, this._Entity.className(), `executeApiHandlers - Error: Api Handler function not found`);
                return res.status(500).json({ error: "Api Handler function not found " });
            }
        } else {
            console_error(0, this._Entity.className(), `executeApiHandlers - Error: Wrong Custom Api route`);
            return res.status(405).json({ error: "Wrong Custom Api route " });
        }
    }


    public static async createProtocolTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
        if (req.method === 'POST') {
            console_log(1, this._Entity.className(), `Sell Tx - POST - Init`);
            try {
                const sanitizedBody = sanitizeForDatabase(req.body);

                // Destructure required parameters from the request body
                const {
                    walletTxParams,
                    txParams,
                }: {
                    walletTxParams: WalletTxParams;
                    txParams: CreateProtocolTxParams;
                } = sanitizedBody;

                console_log(0, this._Entity.className(), `Sell Tx - txParams: ${showData(txParams)}`);

                // Emulator sync for development environment only
                if (isEmulator) {
                    // await TimeBackEnd.syncBlockChainWithServerTime()
                }

                // Prepare Lucid for transaction handling and wallet info
                const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);
                const { utxos: uTxOsAtWallet, address } = walletTxParams;

                // Extract transaction parameters related to the asset for sale
                const { mayzAmount, meshWallet } = txParams;

                const { scriptCbor: protocolScriptHash, scriptAddr: protocolScriptAddress } =
                    getScript(protocolAdminPreScriptCBORHEX, [uTxOsAtWallet[0].txHash, strToHex(protocolIdTn)], 'V3');

                const protocolIdCs = resolveScriptHash(protocolScriptHash);
                const paymentPKH = addressToPubKeyHash(address);

                // Generate datum object with relevant sale data and no min ADA yet
                const datumPlainObjectWithoutMinADA = {
                    pd_admins: list([paymentPKH]),
                    pd_token_admin_policy_id: protocolIdCs,
                    pd_mayz_policy_id: mayzPolicyId,
                    pd_mayz_tn: BigInt(mayzTn),
                    pd_mayz_deposit_requirement: BigInt(mayzAmount),
                    pd_min_ada: BigInt(0),
                };

                const policyID_AC = protocolIdCs + strToHex(protocolIdTn);
                const policyID_Value: Assets = { [policyID_AC]: 1n };

                let valueForTx: Assets = policyID_Value;

                const minAdaParameter = calculateMinAdaOfUTxO({
                    datum: ProtocolAdminEntity.datumToCborHex(datumPlainObjectWithoutMinADA),
                    assets: valueForTx,
                });
                const minAdaValue: Assets = {
                    lovelace: minAdaParameter,
                };
                valueForTx = addAssetsList([minAdaValue, valueForTx]);

                // Generate datum object with min ADA calculated
                const datumPlainObject = {
                    ...datumPlainObjectWithoutMinADA,
                    pd_min_ada: BigInt(minAdaParameter),
                };

                // Create and encode the datum for the transaction
                let datumOfTx = ProtocolAdminEntity.mkDatumFromPlainObject(datumPlainObject);
                const datumOfTxHex = ProtocolAdminEntity.datumToCborHex(datumOfTx);

                // Create minting policy and redeemers for the sale transaction
                const otcNftMintRedeemer = new CreateProtocol();
                const otcNftMintRedeemerHex = objToCborHex(otcNftMintRedeemer);

                // Time range setup for the transaction
                const { now, from, until } = await TimeBackEnd.getTxTimeRange();
                
                const utxos = await meshWallet.getUtxos();

                let txBuilder = getTxBuilder();
                const tx = await txBuilder
                    .mintPlutusScriptV3()
                    .mint("1", protocolIdCs, strToHex(protocolIdTn))
                    .mintingScript(protocolScriptHash)
                    .mintRedeemerValue(otcNftMintRedeemerHex)
                    .txOut(protocolScriptAddress, convertLucidAssetsToMesh(valueForTx))
                    .txOutInlineDatumValue(datumOfTxHex, "CBOR")
                    .selectUtxosFrom(utxos)
                    .changeAddress(address)
                    .complete()
                    
                const txComplete = await meshWallet.signTx(tx);
                const txHash = await meshWallet.submitTx(tx);
                const txCborHex = txComplete.toString();

                // Create and save transaction entity in the Smart DB
                const transactionOTCPolicyRedeemerMintID: TransactionRedeemer= {
                    tx_index: 0,
                    purpose: 'mint',
                    redeemerObj: otcNftMintRedeemer,
                };

                const transactionOTCDatum_Out: TransactionDatum = {
                    address: protocolScriptAddress,
                    datumType: ProtocolAdminEntity.className(),
                    datumObj: datumOfTx,
                };

                const transaction: TransactionEntity = new TransactionEntity({
                    paymentPKH: walletTxParams.pkh,
                    date: new Date(now),
                    type: PROTOCOL_CREATE,
                    hash: txHash,
                    status: TRANSACTION_STATUS_PENDING,
                    ids: {},
                    redeemers: {
                        OTCPolicyRedeemerMintID: transactionOTCPolicyRedeemerMintID,
                    },
                    datums: { OTCDatum_Out: transactionOTCDatum_Out },
                    consuming_UTxOs: [],
                });
                await TransactionBackEndApplied.create(transaction);

                const localProtocol: LocalProtocolAdminEntity = new LocalProtocolAdminEntity({
                        pp_protocol_address:  protocolScriptAddress,
                        pp_protocol_id_tn:  protocolIdTn,
                        pp_protocol_policy_id:  protocolIdCs,
                        pp_protocol_script_hash: protocolScriptHash,
                });
                await LocalProtocolAdminBackEndApplied.create(localProtocol);

                return res.status(200).json({ txCborHex, txHash });
            } catch (error) {
                console_error(-1, this._Entity.className(), `Sell Tx - Error: ${error}`);
                return res.status(500).json({
                    error: `An error occurred while creating the ${this._Entity.apiRoute()} Sell Tx: ${error}`,
                });
            }
        } else {
            console_error(-1, this._Entity.className(), `Sell Tx - Error: Method not allowed`);
            return res.status(405).json({ error: `Method not allowed` });
        }
    }


    // #endregion custom api handlers
}

