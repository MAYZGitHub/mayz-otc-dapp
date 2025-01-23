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
    optionsGetMinimalWithSmartUTxOCompleteFields,
    sanitizeForDatabase,
    showData,
    strToHex,
} from 'smart-db/backEnd';
import { OTCEntity } from '../Entities/OTC.Entity';
import { Assets, Tx } from 'lucid-cardano';
import { mayzLockAmount, mayzPolicyId, mayzTn, mintingPolicyID_TN } from '../../Commons/Constants/onchain';
import { BurnNFT, CancelOTC, ClaimOTC, CloseOTC, CreateOTC, MintNFT } from '../Entities/Redeemers/OTC.Redeemer';
import { CancelOTCTxParams, ClaimOTCTxParams, CloseOTCTxParams, CreateOTCTxParams, OTC_CANCEL, OTC_CLAIM, OTC_CLOSE, OTC_CREATE } from '../../Commons/Constants/transactions';

@BackEndAppliedFor(OTCEntity)
export class OTCBackEndApplied extends BaseSmartDBBackEndApplied {
    protected static _Entity = OTCEntity;
    protected static _BackEndMethods = BaseSmartDBBackEndMethods;
}

@BackEndApiHandlersFor(OTCEntity)
export class OTCApiHandlers extends BaseSmartDBBackEndApiHandlers {
    protected static _Entity = OTCEntity;
    protected static _BackEndApplied = OTCBackEndApplied;
    // #region custom api handlers

    protected static _ApiHandlers: string[] = ['tx'];

    protected static async executeApiHandlers(command: string, req: NextApiRequestAuthenticated, res: NextApiResponse) {
        //--------------------
        const { query } = req.query;
        //--------------------
        if (this._ApiHandlers.includes(command) && query !== undefined) {
            if (query[0] === 'tx') {
                if (query.length === 2) {
                    if (query[1] === 'create-tx') {
                        return await this.createOtcTxApiHandler(req, res);
                    } else if (query[1] === 'claim-tx') {
                        return await this.claimTxApiHandler(req, res);
                    } else if (query[1] === 'close-tx') {
                        return await this.closeTxApiHandler(req, res);
                    } else if (query[1] === 'cancel-tx') {
                        return await this.cancelTxApiHandler(req, res);
                    }
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


    public static async createOtcTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
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
                    txParams: CreateOTCTxParams;
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
                const { lockAmount, policyIdCS, lockTokenTN, lockTokenCS, otcNftPolicyId, validatorAddress, mintingOtcNFT } = txParams;

                const paymentPKH = addressToPubKeyHash(address);
                const otcNftTN = `OTC-${lockTokenTN}-${lockAmount}`

                // Generate datum object with relevant sale data and no min ADA yet
                const datumPlainObjectWithoutMinADA = {
                    od_creator: paymentPKH,
                    od_token_policy_id: policyIdCS,
                    od_token_tn: strToHex(lockTokenTN),
                    od_token_amount: BigInt(lockAmount),
                    od_otc_nft_policy_id: otcNftPolicyId,
                    od_otc_nft_tn: strToHex(otcNftTN),
                    od_mayz_policy_id: mayzPolicyId,
                    od_mayz_tn: strToHex(mayzTn),
                    od_mayz_locked: BigInt(mayzLockAmount),
                    od_min_ada: BigInt(0),
                };

                const policyID_AC = policyIdCS + strToHex(mintingPolicyID_TN);
                const policyID_Value: Assets = { [policyID_AC]: 1n };

                let valueForTx: Assets = policyID_Value;

                const lockTokenAC = lockTokenCS + strToHex(lockTokenTN);
                const lockTokenValue: Assets = { [lockTokenAC]: lockAmount };

                // Add additional values to the transaction, including minimum ADA requirement
                valueForTx = addAssetsList([lockTokenValue, valueForTx]);

                const otcNFT_AC = otcNftPolicyId + strToHex(otcNftTN);
                const otcNFT_Value: Assets = { [otcNFT_AC]: 1n };

                // Add additional values to the transaction, including minimum ADA requirement
                valueForTx = addAssetsList([otcNFT_Value, valueForTx]);

                const mayz_AC = mayzPolicyId + strToHex(mayzTn);
                const mayz_Value: Assets = { [mayz_AC]: mayzLockAmount };

                // Add additional values to the transaction, including minimum ADA requirement
                valueForTx = addAssetsList([mayz_Value, valueForTx]);

                const minAdaParameter = calculateMinAdaOfUTxO({
                    datum: OTCEntity.datumToCborHex(datumPlainObjectWithoutMinADA),
                    assets: valueForTx,
                });
                const minAdaValue: Assets = {
                    lovelace: minAdaParameter,
                };
                valueForTx = addAssetsList([minAdaValue, valueForTx]);

                // Generate datum object with min ADA calculated
                const datumPlainObject = {
                    ...datumPlainObjectWithoutMinADA,
                    od_min_ada: BigInt(minAdaParameter),
                };

                // Create and encode the datum for the transaction
                let datumOfTx = OTCEntity.mkDatumFromPlainObject(datumPlainObject);
                const datumOfTxHex = OTCEntity.datumToCborHex(datumOfTx);

                // Create minting policy and redeemers for the sale transaction
                const otcNftMintRedeemer = new MintNFT();
                const otcNftMintRedeemerHex = objToCborHex(otcNftMintRedeemer);

                // Create minting policy and redeemers for the sale transaction
                const otcPolicyIdMintRedeemer = new CreateOTC();
                const otcPolicyIdMintRedeemerHex = objToCborHex(otcPolicyIdMintRedeemer);

                // Time range setup for the transaction
                const { now, from, until } = await TimeBackEnd.getTxTimeRange();

                let tx: Tx = lucid.newTx();
                tx = tx
                    .mintAssets(policyID_Value, otcPolicyIdMintRedeemerHex)
                    .mintAssets(otcNFT_Value, otcNftMintRedeemerHex)
                    .payToContract(validatorAddress, { inline: datumOfTxHex }, valueForTx)
                    .attachMintingPolicy(mintingOtcNFT);

                const txComplete = await tx.complete();
                const txCborHex = txComplete.toString();
                const txHash = txComplete.toHash();

                // Create and save transaction entity in the Smart DB
                const transactionOTCPolicyRedeemerMintID: TransactionRedeemer = {
                    tx_index: 0,
                    purpose: 'mint',
                    redeemerObj: otcNftMintRedeemer,
                };

                const transactionOTCDatum_Out: TransactionDatum = {
                    address: validatorAddress,
                    datumType: OTCEntity.className(),
                    datumObj: datumOfTx,
                };

                const transaction: TransactionEntity = new TransactionEntity({
                    paymentPKH: walletTxParams.pkh,
                    date: new Date(now),
                    type: OTC_CREATE,
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


    public static async claimTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
        // Checks if the HTTP method is POST to handle the claimal transaction
        if (req.method === 'POST') {
            console_log(1, this._Entity.className(), `claim Tx - POST - Init`);

            try {
                // Sanitizes the incoming request body to prevent potential database-related security issues
                const sanitizedBody = sanitizeForDatabase(req.body);

                // Destructures `walletTxParams` and `txParams` from the sanitized request body
                const {
                    walletTxParams,
                    txParams,
                }: {
                    walletTxParams: WalletTxParams;
                    txParams: ClaimOTCTxParams;
                } = sanitizedBody;

                // Logs the transaction parameters for debugging
                console_log(0, this._Entity.className(), `claim Tx - txParams: ${showData(txParams)}`);

                // Ensures synchronization of the blockchain with server time if running in emulator mode
                if (isEmulator) {
                    // Uncomment this line to synchronize the emulator with server time
                    // await TimeBackEnd.syncBlockChainWithServerTime()
                }

                // Prepares the Lucid instance for transaction processing
                const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);

                // Extracts UTxOs and address from wallet transaction parameters
                const { utxos: uTxOsAtWallet, address } = walletTxParams;

                // Extracts specific parameters required for processing the transaction
                const { otcDbId, validatorAddress, OTCScript } = txParams;

                // Retrieves the OTC associated with the transaction based on the provided ID
                const Otc = await OTCBackEndApplied.getById_<OTCEntity>(otcDbId, {
                    ...optionsGetMinimalWithSmartUTxOCompleteFields,
                });

                // Throws an error if the OTC is not found
                if (Otc === undefined) {
                    throw `Invalid OTC id`;
                }

                // Checks that the OTC has an associated smart UTxO and is available for consumption
                const OTC_SmartUTxO = Otc.smartUTxO;
                if (OTC_SmartUTxO === undefined) {
                    throw `Can't find OTC UTxO`;
                }
                if (OTC_SmartUTxO.unsafeIsAvailableForConsuming() === false) {
                    throw `OTC UTxO is being used, please wait and try again`;
                }

                // Constructs asset values for seller tokens plus ADA and logs it
                const lockTokenAC = Otc.od_token_policy_id + strToHex(Otc.od_token_tn);
                const lockTokenValue: Assets = { [lockTokenAC]: Otc.od_token_amount };

                console_log(0, this._Entity.className(), `claim Tx - valueFor_LockToken: ${showData(lockTokenValue)}`);

                // Generate datum object with relevant sale data and no min ADA yet
                const datumPlainObject = {
                    od_creator: Otc.od_creator,
                    od_token_policy_id: Otc.od_token_policy_id,
                    od_token_tn: Otc.od_token_tn,
                    od_token_amount: Otc.od_token_amount,
                    od_otc_nft_policy_id: Otc.od_otc_nft_policy_id,
                    od_otc_nft_tn: Otc.od_otc_nft_tn,
                    od_mayz_policy_id: Otc.od_mayz_policy_id,
                    od_mayz_tn: Otc.od_mayz_tn,
                    od_mayz_locked: Otc.od_mayz_locked,
                    od_min_ada: Otc.od_min_ada,
                };

                const policyID_AC = Otc.od_token_policy_id + strToHex(mintingPolicyID_TN);
                const policyID_Value: Assets = { [policyID_AC]: 1n };

                let valueForGetBackToContract: Assets = policyID_Value;

                const otcNFT_AC = Otc.od_otc_nft_policy_id + strToHex(Otc.od_otc_nft_tn);
                const otcNFT_Value: Assets = { [otcNFT_AC]: 1n };

                // Add additional values to the transaction, including minimum ADA requirement
                valueForGetBackToContract = addAssetsList([otcNFT_Value, valueForGetBackToContract]);

                const mayz_AC = mayzPolicyId + strToHex(mayzTn);
                const mayz_Value: Assets = { [otcNFT_AC]: mayzLockAmount };

                // Add additional values to the transaction, including minimum ADA requirement
                valueForGetBackToContract = addAssetsList([mayz_Value, valueForGetBackToContract]);

                const minAdaValue: Assets = {
                    lovelace: Otc.od_min_ada,
                };
                valueForGetBackToContract = addAssetsList([minAdaValue, valueForGetBackToContract]);


                // Gets the UTxO associated with the OTC
                const OTC_UTxO = OTC_SmartUTxO.getUTxO();

                // Create and encode the datum for the transaction
                let datumOfTx = OTCEntity.mkDatumFromPlainObject(datumPlainObject);
                const datumOfTxHex = OTCEntity.datumToCborHex(datumOfTx);

                // Creates a redeemer for the validator and converts it to CBOR format for transaction claimal
                const OTCValidatorRedeemerclaim = new ClaimOTC();
                console_log(0, this._Entity.className(), `claim Tx - OTCValidatorRedeemerclaim: ${showData(OTCValidatorRedeemerclaim, false)}`);
                const OTCValidatorRedeemerclaim_Hex = objToCborHex(OTCValidatorRedeemerclaim);
                console_log(0, this._Entity.className(), `claim Tx - OTCValidatorRedeemerclaim_Hex: ${showData(OTCValidatorRedeemerclaim_Hex, false)}`);

                // Sets the transaction time range and logs it
                const { now, from, until } = await TimeBackEnd.getTxTimeRange();
                console_log(0, this._Entity.className(), `claim Tx - from ${from} to ${until}`);

                // Initializes a new Lucid transaction object
                let tx: Tx = lucid.newTx();

                // Configures transaction actions: mint, collect, attach policies, and send funds
                tx = tx
                    .collectFrom([OTC_UTxO], OTCValidatorRedeemerclaim_Hex)
                    .attachSpendingValidator(OTCScript)
                    .payToAddress(address, lockTokenValue)
                    .payToContract(validatorAddress, { inline: datumOfTxHex }, valueForGetBackToContract)
                    .addSigner(address);

                // Completes the transaction preparation
                const txComplete = await tx.complete();

                // Converts the transaction to CBOR Hex and computes the hash
                const txCborHex = txComplete.toString();
                const txHash = txComplete.toHash();
                console_log(0, this._Entity.className(), `claim Tx - txHash: ${showData(txHash)}`);

                // Creates transaction redeemer entities for record-keeping
                const transactionOTCValidatorRedeemerclaim: TransactionRedeemer = {
                    tx_index: 0,
                    purpose: 'spend',
                    redeemerObj: OTCValidatorRedeemerclaim,
                };

                // Defines the input datum for the transaction
                const transactionOTCDatum_In: TransactionDatum = {
                    address: OTC_SmartUTxO.address,
                    datumType: OTCEntity.className(),
                    datumObj: OTC_SmartUTxO.datumObj,
                };

                // Creates and stores a new transaction entity in the backend
                const transaction: TransactionEntity = new TransactionEntity({
                    paymentPKH: walletTxParams.pkh,
                    date: new Date(now),
                    type: OTC_CLAIM,
                    hash: txHash,
                    status: TRANSACTION_STATUS_PENDING,
                    ids: {},
                    redeemers: {
                        OTCValidatorRedeemerclaim: transactionOTCValidatorRedeemerclaim,
                    },
                    datums: { OTCDatum_In: transactionOTCDatum_In },
                    consuming_UTxOs: [OTC_UTxO],
                });
                await TransactionBackEndApplied.create(transaction);

                // Logs the transaction CBOR Hex and returns it in the response
                console_log(-1, this._Entity.className(), `claim Tx - txCborHex: ${showData(txCborHex)}`);
                return res.status(200).json({ txCborHex, txHash });
            } catch (error) {
                // Logs any errors encountered and sends a 500 response with the error message
                console_error(-1, this._Entity.className(), `claim Tx - Error: ${error}`);
                return res.status(500).json({
                    error: `An error occurred while creating the ${this._Entity.apiRoute()} claim Tx: ${error}`,
                });
            }
        } else {
            // Handles unsupported HTTP methods with a 405 response
            console_error(-1, this._Entity.className(), `claim Tx - Error: Method not allowed`);
            return res.status(405).json({ error: `Method not allowed` });
        }
    }

    public static async closeTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
        // Checks if the HTTP method is POST to handle the Closeal transaction
        if (req.method === 'POST') {
            console_log(1, this._Entity.className(), `Close Tx - POST - Init`);

            try {
                // Sanitizes the incoming request body to prevent potential database-related security issues
                const sanitizedBody = sanitizeForDatabase(req.body);

                // Destructures `walletTxParams` and `txParams` from the sanitized request body
                const {
                    walletTxParams,
                    txParams,
                }: {
                    walletTxParams: WalletTxParams;
                    txParams: CloseOTCTxParams;
                } = sanitizedBody;

                // Logs the transaction parameters for debugging
                console_log(0, this._Entity.className(), `Close Tx - txParams: ${showData(txParams)}`);

                // Ensures synchronization of the blockchain with server time if running in emulator mode
                if (isEmulator) {
                    // Uncomment this line to synchronize the emulator with server time
                    // await TimeBackEnd.syncBlockChainWithServerTime()
                }

                // Prepares the Lucid instance for transaction processing
                const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);

                // Extracts UTxOs and address from wallet transaction parameters
                const { utxos: uTxOsAtWallet, address } = walletTxParams;

                // Extracts specific parameters required for processing the transaction
                const { otcDbId, OTCScript, mintingOtcNFT } = txParams;

                // Retrieves the OTC associated with the transaction based on the provided ID
                const Otc = await OTCBackEndApplied.getById_<OTCEntity>(otcDbId, {
                    ...optionsGetMinimalWithSmartUTxOCompleteFields,
                });

                // Throws an error if the OTC is not found
                if (Otc === undefined) {
                    throw `Invalid OTC id`;
                }

                // Checks that the OTC has an associated smart UTxO and is available for consumption
                const OTC_SmartUTxO = Otc.smartUTxO;
                if (OTC_SmartUTxO === undefined) {
                    throw `Can't find OTC UTxO`;
                }
                if (OTC_SmartUTxO.unsafeIsAvailableForConsuming() === false) {
                    throw `OTC UTxO is being used, please wait and try again`;
                }

                const policyID_AC = Otc.od_token_policy_id + strToHex(mintingPolicyID_TN);
                const policyID_Value: Assets = { [policyID_AC]: 1n };

                const otcNFT_AC = Otc.od_otc_nft_policy_id + strToHex(Otc.od_otc_nft_tn);
                const otcNFT_Value: Assets = { [otcNFT_AC]: 1n };

                const mayz_AC = mayzPolicyId + strToHex(mayzTn);
                const mayz_Value: Assets = { [mayz_AC]: mayzLockAmount };

                // Add additional values to the transaction, including minimum ADA requirement
                let valueForGetBackToUser = mayz_Value;

                const minAdaValue: Assets = {
                    lovelace: Otc.od_min_ada,
                };
                valueForGetBackToUser = addAssetsList([minAdaValue, valueForGetBackToUser]);


                // Gets the UTxO associated with the OTC
                const OTC_UTxO = OTC_SmartUTxO.getUTxO();

                // Create minting policy and redeemers for the sale transaction
                const otcNftBurnRedeemer = new BurnNFT();
                const otcNftBurnRedeemerHex = objToCborHex(otcNftBurnRedeemer);

                // Create minting policy and redeemers for the sale transaction
                const OTCValidatorRedeemerClose = new CloseOTC();
                const otcPolicyIdBurnRedeemerCloseHex = objToCborHex(OTCValidatorRedeemerClose);

                // Sets the transaction time range and logs it
                const { now, from, until } = await TimeBackEnd.getTxTimeRange();
                console_log(0, this._Entity.className(), `Close Tx - from ${from} to ${until}`);

                // Initializes a new Lucid transaction object
                let tx: Tx = lucid.newTx();

                // Configures transaction actions: mint, collect, attach policies, and send funds
                tx = tx
                    .mintAssets(policyID_Value, otcPolicyIdBurnRedeemerCloseHex)
                    .mintAssets(otcNFT_Value, otcNftBurnRedeemerHex)
                    .collectFrom([OTC_UTxO], otcPolicyIdBurnRedeemerCloseHex)
                    .attachSpendingValidator(OTCScript)
                    .attachMintingPolicy(mintingOtcNFT)
                    .payToAddress(address, valueForGetBackToUser)
                    .addSigner(address);
                    

                // Completes the transaction preparation
                const txComplete = await tx.complete();

                // Converts the transaction to CBOR Hex and computes the hash
                const txCborHex = txComplete.toString();
                const txHash = txComplete.toHash();
                console_log(0, this._Entity.className(), `Close Tx - txHash: ${showData(txHash)}`);

                // Creates transaction redeemer entities for record-keeping
                const transactionOTCValidatorRedeemerClose: TransactionRedeemer = {
                    tx_index: 0,
                    purpose: 'spend',
                    redeemerObj: OTCValidatorRedeemerClose,
                };
                
                // Creates transaction redeemer entities for record-keeping
                const transactionMarketNFTPolicyRedeemerBurnID: TransactionRedeemer = {
                    tx_index: 0,
                    purpose: 'mint',
                    redeemerObj: otcNftBurnRedeemer,
                };


                // Defines the input datum for the transaction
                const transactionOTCDatum_In: TransactionDatum = {
                    address: OTC_SmartUTxO.address,
                    datumType: OTCEntity.className(),
                    datumObj: OTC_SmartUTxO.datumObj,
                };

                // Creates and stores a new transaction entity in the backend
                const transaction: TransactionEntity = new TransactionEntity({
                    paymentPKH: walletTxParams.pkh,
                    date: new Date(now),
                    type: OTC_CLOSE,
                    hash: txHash,
                    status: TRANSACTION_STATUS_PENDING,
                    ids: {},
                    redeemers: {
                        marketNftPolicyRedeemerBurnID: transactionMarketNFTPolicyRedeemerBurnID,
                        OTCValidatorRedeemerClose: transactionOTCValidatorRedeemerClose,
                    },
                    datums: { OTCDatum_In: transactionOTCDatum_In },
                    consuming_UTxOs: [OTC_UTxO],
                });
                await TransactionBackEndApplied.create(transaction);

                // Logs the transaction CBOR Hex and returns it in the response
                console_log(-1, this._Entity.className(), `Close Tx - txCborHex: ${showData(txCborHex)}`);
                return res.status(200).json({ txCborHex, txHash });
            } catch (error) {
                // Logs any errors encountered and sends a 500 response with the error message
                console_error(-1, this._Entity.className(), `Close Tx - Error: ${error}`);
                return res.status(500).json({
                    error: `An error occurred while creating the ${this._Entity.apiRoute()} Close Tx: ${error}`,
                });
            }
        } else {
            // Handles unsupported HTTP methods with a 405 response
            console_error(-1, this._Entity.className(), `Close Tx - Error: Method not allowed`);
            return res.status(405).json({ error: `Method not allowed` });
        }
    }

    public static async cancelTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
        // Checks if the HTTP method is POST to handle the Cancelal transaction
        if (req.method === 'POST') {
            console_log(1, this._Entity.className(), `Cancel Tx - POST - Init`);

            try {
                // Sanitizes the incoming request body to prevent potential database-related security issues
                const sanitizedBody = sanitizeForDatabase(req.body);

                // Destructures `walletTxParams` and `txParams` from the sanitized request body
                const {
                    walletTxParams,
                    txParams,
                }: {
                    walletTxParams: WalletTxParams;
                    txParams: CancelOTCTxParams;
                } = sanitizedBody;

                // Logs the transaction parameters for debugging
                console_log(0, this._Entity.className(), `Cancel Tx - txParams: ${showData(txParams)}`);

                // Ensures synchronization of the blockchain with server time if running in emulator mode
                if (isEmulator) {
                    // Uncomment this line to synchronize the emulator with server time
                    // await TimeBackEnd.syncBlockChainWithServerTime()
                }

                // Prepares the Lucid instance for transaction processing
                const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);

                // Extracts UTxOs and address from wallet transaction parameters
                const { utxos: uTxOsAtWallet, address } = walletTxParams;

                // Extracts specific parameters required for processing the transaction
                const { otcDbId, OTCScript, mintingOtcNFT } = txParams;

                // Retrieves the OTC associated with the transaction based on the provided ID
                const Otc = await OTCBackEndApplied.getById_<OTCEntity>(otcDbId, {
                    ...optionsGetMinimalWithSmartUTxOCompleteFields,
                });

                // Throws an error if the OTC is not found
                if (Otc === undefined) {
                    throw `Invalid OTC id`;
                }

                // Checks that the OTC has an associated smart UTxO and is available for consumption
                const OTC_SmartUTxO = Otc.smartUTxO;
                if (OTC_SmartUTxO === undefined) {
                    throw `Can't find OTC UTxO`;
                }
                if (OTC_SmartUTxO.unsafeIsAvailableForConsuming() === false) {
                    throw `OTC UTxO is being used, please wait and try again`;
                }

                const policyID_AC = Otc.od_token_policy_id + strToHex(mintingPolicyID_TN);
                const policyID_Value: Assets = { [policyID_AC]: 1n };

                const otcNFT_AC = Otc.od_otc_nft_policy_id + strToHex(Otc.od_otc_nft_tn);
                const otcNFT_Value: Assets = { [otcNFT_AC]: 1n };

                const mayz_AC = mayzPolicyId + strToHex(mayzTn);
                const mayz_Value: Assets = { [mayz_AC]: mayzLockAmount };

                // Add additional values to the transaction, including minimum ADA requirement
                let valueForGetBackToUser = mayz_Value;

                const minAdaValue: Assets = {
                    lovelace: Otc.od_min_ada,
                };
                valueForGetBackToUser = addAssetsList([minAdaValue, valueForGetBackToUser]);


                // Gets the UTxO associated with the OTC
                const OTC_UTxO = OTC_SmartUTxO.getUTxO();

                // Create minting policy and redeemers for the sale transaction
                const otcNftBurnRedeemer = new BurnNFT();
                const otcNftBurnRedeemerHex = objToCborHex(otcNftBurnRedeemer);

                // Create minting policy and redeemers for the sale transaction
                const OTCValidatorRedeemerCancel = new CancelOTC();
                const otcPolicyIdBurnRedeemerCancelHex = objToCborHex(OTCValidatorRedeemerCancel);

                // Sets the transaction time range and logs it
                const { now, from, until } = await TimeBackEnd.getTxTimeRange();
                console_log(0, this._Entity.className(), `Cancel Tx - from ${from} to ${until}`);

                // Initializes a new Lucid transaction object
                let tx: Tx = lucid.newTx();

                // Configures transaction actions: mint, collect, attach policies, and send funds
                tx = tx
                    .mintAssets(policyID_Value, otcPolicyIdBurnRedeemerCancelHex)
                    .mintAssets(otcNFT_Value, otcNftBurnRedeemerHex)
                    .collectFrom([OTC_UTxO], otcPolicyIdBurnRedeemerCancelHex)
                    .attachSpendingValidator(OTCScript)
                    .attachMintingPolicy(mintingOtcNFT)
                    .payToAddress(address, valueForGetBackToUser)
                    .addSigner(address);
                    

                // Completes the transaction preparation
                const txComplete = await tx.complete();

                // Converts the transaction to CBOR Hex and computes the hash
                const txCborHex = txComplete.toString();
                const txHash = txComplete.toHash();
                console_log(0, this._Entity.className(), `Cancel Tx - txHash: ${showData(txHash)}`);

                // Creates transaction redeemer entities for record-keeping
                const transactionOTCValidatorRedeemerCancel: TransactionRedeemer = {
                    tx_index: 0,
                    purpose: 'spend',
                    redeemerObj: OTCValidatorRedeemerCancel,
                };
                
                // Creates transaction redeemer entities for record-keeping
                const transactionMarketNFTPolicyRedeemerBurnID: TransactionRedeemer = {
                    tx_index: 0,
                    purpose: 'mint',
                    redeemerObj: otcNftBurnRedeemer,
                };


                // Defines the input datum for the transaction
                const transactionOTCDatum_In: TransactionDatum = {
                    address: OTC_SmartUTxO.address,
                    datumType: OTCEntity.className(),
                    datumObj: OTC_SmartUTxO.datumObj,
                };

                // Creates and stores a new transaction entity in the backend
                const transaction: TransactionEntity = new TransactionEntity({
                    paymentPKH: walletTxParams.pkh,
                    date: new Date(now),
                    type: OTC_CANCEL,
                    hash: txHash,
                    status: TRANSACTION_STATUS_PENDING,
                    ids: {},
                    redeemers: {
                        marketNftPolicyRedeemerBurnID: transactionMarketNFTPolicyRedeemerBurnID,
                        OTCValidatorRedeemerCancel: transactionOTCValidatorRedeemerCancel,
                    },
                    datums: { OTCDatum_In: transactionOTCDatum_In },
                    consuming_UTxOs: [OTC_UTxO],
                });
                await TransactionBackEndApplied.create(transaction);

                // Logs the transaction CBOR Hex and returns it in the response
                console_log(-1, this._Entity.className(), `Cancel Tx - txCborHex: ${showData(txCborHex)}`);
                return res.status(200).json({ txCborHex, txHash });
            } catch (error) {
                // Logs any errors encountered and sends a 500 response with the error message
                console_error(-1, this._Entity.className(), `Cancel Tx - Error: ${error}`);
                return res.status(500).json({
                    error: `An error occurred while creating the ${this._Entity.apiRoute()} Cancel Tx: ${error}`,
                });
            }
        } else {
            // Handles unsupported HTTP methods with a 405 response
            console_error(-1, this._Entity.className(), `Cancel Tx - Error: Method not allowed`);
            return res.status(405).json({ error: `Method not allowed` });
        }
    }
    // #endregion custom api handlers
}

