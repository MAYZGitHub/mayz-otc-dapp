import {
    CancelOTCTxParams,
    CancelOtcTxParamsSchema,
    ClaimOTCTxParams,
    ClaimOtcTxParamsSchema,
    CloseOTCTxParams,
    CloseOtcTxParamsSchema,
    CreateOTCTxParams,
    CreateOtcTxParamsSchema,
    OTC_ID_TN_Str,
    TxEnums,
} from '@/utils/constants/on-chain';
import { Address, applyParamsToScript, Assets, Constr, mintingPolicyToId, PolicyId, Script, slotToUnixTime, TxBuilder } from '@lucid-evolution/lucid';
import { NextApiResponse } from 'next';
import {
    ADA_THRESHOLD,
    addAssetsList,
    addressToPubKeyHash,
    BackEndApiHandlersFor,
    BackEndAppliedFor,
    BaseSmartDBBackEndApiHandlers,
    BaseSmartDBBackEndApplied,
    BaseSmartDBBackEndMethods,
    bigIntMax,
    calculateMinAdaOfUTxO,
    console_error,
    console_log,
    convertMillisToTime,
    fixUTxOList,
    getTxRedeemersDetailsAndResources,
    LucidToolsBackEnd,
    NextApiRequestAuthenticated,
    objToCborHex,
    optionsGetMinimalWithSmartUTxOCompleteFields,
    PaymentPubKey,
    sanitizeForDatabase,
    showData,
    strToHex,
    TimeBackEnd,
    TN,
    toJson,
    TRANSACTION_STATUS_CREATED,
    TransactionBackEndApplied,
    TransactionDatum,
    TransactionEntity,
    TransactionRedeemer,
    WalletTxParams,
    yup,
} from 'smart-db/backEnd';
import { OTCDatum, OTCEntity } from '../Entities/OTC.Entity';
import { ProtocolEntity } from '../Entities/Protocol.Entity';
import { BurnNFT, CancelOTC, ClaimOTC, CloseOTC, CreateOTC, MintNFT } from '../Entities/Redeemers/OTC.Redeemer';
import { ProtocolBackEndApplied } from './Protocol.BackEnd.Api.Handlers';

@BackEndAppliedFor(OTCEntity)
export class OTCBackEndApplied extends BaseSmartDBBackEndApplied {
    protected static _Entity = OTCEntity;
    protected static _BackEndMethods = BaseSmartDBBackEndMethods;

    public static mkNew_OTCDatum(
        txParams: CreateOTCTxParams,
        mindAda: bigint,
        protocol: ProtocolEntity,
        creator: PaymentPubKey,
        otc_nft_policy_id: PolicyId,
        otc_nft_tn: TN
    ): OTCDatum {
        // usado para que los campos del datum tengan las clases y tipos bien
        // txParams trae los campos pero estan plain, no son clases ni tipos

        const datumPlainObject: OTCDatum = {
            od_creator: creator,
            od_token_policy_id: txParams.od_token_policy_id,
            od_token_tn: txParams.od_token_tn,
            od_token_amount: BigInt(txParams.od_token_amount),
            od_otc_nft_policy_id: otc_nft_policy_id,
            od_otc_nft_tn: otc_nft_tn,
            od_mayz_policy_id: protocol.pd_mayz_policy_id,
            od_mayz_tn: protocol.pd_mayz_tn,
            od_mayz_locked: protocol.pd_mayz_deposit_requirement,
            od_min_ada: mindAda,
        };
        let datum: OTCDatum = OTCEntity.mkDatumFromPlainObject(datumPlainObject) as OTCDatum;
        return datum;
    }

    public static mkClaim_OTCDatum(otcDatum_In: OTCDatum): OTCDatum {
        const datumPlainObject: OTCDatum = {
            ...JSON.parse(toJson(otcDatum_In)),
        };

        let datum: OTCDatum = OTCEntity.mkDatumFromPlainObject(datumPlainObject) as OTCDatum;
        return datum;
    }

    public static mkClose_OTCDatum(otcDatum_In: OTCDatum): OTCDatum {
        return OTCBackEndApplied.mkClaim_OTCDatum(otcDatum_In);
    }

    public static generateOtcName(tokenTn: string, amount: bigint): string {
        // "OTC-" in hex is "4F54432D"
        const prefix = '4f54432d';
        // Append token name
        const withToken = prefix + tokenTn;
        // Append separator "-" (hex: 2D)
        const withSeparator = withToken + '2d';
        // Format amount and append
        const formattedAmount = this.formatLargeNumber(amount);
        return withSeparator + formattedAmount;
    }

    private static formatLargeNumber(n: bigint): string {
        // Convert number to string
        const numberAsString = n.toString();
        // Convert string to hex bytes
        return strToHex(numberAsString);
    }
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
                    if (query[1] === 'create-otc-tx') {
                        return await this.createOTCTxApiHandler(req, res);
                    } else if (query[1] === 'claim-otc-tx') {
                        return await this.claimTxApiHandler(req, res);
                    } else if (query[1] === 'close-otc-tx') {
                        return await this.closeTxApiHandler(req, res);
                    } else if (query[1] === 'cancel-otc-tx') {
                        return await this.cancelTxApiHandler(req, res);
                    }
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

    public static async createOTCTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
        if (req.method === 'POST') {
            console_log(1, this._Entity.className(), `Create OTC Tx - POST - Init`);
            try {
                //-------------------------
                const sanitizedBody = sanitizeForDatabase(req.body);
                //-------------------------
                const { walletTxParams, txParams }: { walletTxParams: WalletTxParams; txParams: CreateOTCTxParams } = sanitizedBody;
                //--------------------------------------
                console_log(0, this._Entity.className(), `Create OTC Tx - walletTxParams: ${showData(walletTxParams)}`);
                //--------------------------------------
                try {
                    const validTxParams = await CreateOtcTxParamsSchema.validate(txParams, { abortEarly: false });
                    console_log(0, this._Entity.className(), `Create OTC Tx - txParams: ${showData(validTxParams)}`);
                } catch (error) {
                    if (error instanceof yup.ValidationError) {
                        throw new Error(`Validation failed: ${error.errors.join(', ')}`);
                    }
                    throw error;
                }
                //--------------------------------------
                // Prepare Lucid for transaction handling and wallet info
                const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);
                //--------------------------------------
                walletTxParams.utxos = fixUTxOList(walletTxParams?.utxos ?? []);
                //--------------------------------------
                const { utxos: uTxOsAtWallet, address } = walletTxParams;
                //--------------------------------------
                // Extract transaction parameters related to the asset for sale
                const { od_token_policy_id, od_token_tn, od_token_amount } = txParams;
                //--------------------------------------
                const protocol = await ProtocolBackEndApplied.getById_<ProtocolEntity>(txParams.protocol_id, {
                    ...optionsGetMinimalWithSmartUTxOCompleteFields,
                    fieldsForSelect: {},
                });
                if (protocol === undefined) {
                    throw `Invalid protocol id`;
                }
                //--------------------------------------
                const protocol_SmartUTxO = protocol.smartUTxO;
                if (protocol_SmartUTxO === undefined) {
                    throw `Can't find Protocol UTxO`;
                }
                //--------------------------------------
                const protocol_UTxO = protocol_SmartUTxO.getUTxO();
                //--------------------------------------
                if (uTxOsAtWallet.length === 0) {
                    throw `No UTxOs found in wallet`;
                }
                //--------------------------------------
                const uTxOsAtWalletForMinting = uTxOsAtWallet[0];
                //--------------------------------------
                const creator = addressToPubKeyHash(address);
                if (creator === undefined) {
                    throw `Invalid address`;
                }
                //--------------------------------------
                const otcValidator_Address: Address = protocol.getOTC_Net_Address();
                const otcValidator_Hash = protocol.fOTCValidator_Hash;
                //--------------------------------------
                const pp_otc_nft_policy_id_tx_out_ref = new Constr(0, [uTxOsAtWalletForMinting.txHash, BigInt(uTxOsAtWalletForMinting.outputIndex)]);
                const pp_otc_validator_hash = otcValidator_Hash;
                const pp_protocol_policy_id = protocol.getNET_id_CS();
                const pp_protocol_id_tn = strToHex(protocol.getNET_id_TN_Str());
                const pp_otc_id_tn = strToHex(OTC_ID_TN_Str);
                //--------------------------------------
                const otcNFTParams = new Constr(0, [pp_otc_nft_policy_id_tx_out_ref, pp_otc_validator_hash, pp_protocol_policy_id, pp_protocol_id_tn, pp_otc_id_tn]);
                //--------------------------------------
                const otcNFTScript: Script = {
                    type: 'PlutusV3',
                    script: applyParamsToScript(protocol.fOTC_NFT_PRE_Script.script, [otcNFTParams]),
                };
                //--------------------------------------
                const otc_NFT_Policy_CS = mintingPolicyToId(otcNFTScript);
                console.log(`otc_NFT_Policy_CS ${otc_NFT_Policy_CS}`);
                const otc_NFT_TN = this._BackEndApplied.generateOtcName(od_token_tn, od_token_amount);
                console.log(`otc_NFT_TN ${otc_NFT_TN}`);
                //--------------------------------------
                const otc_ID_AC_Lucid = protocol.getOTC_NET_id_CS() + strToHex(OTC_ID_TN_Str);
                const otc_NFT_AC_Lucid = otc_NFT_Policy_CS + otc_NFT_TN;
                //--------------------------------------
                const valueFor_Mint_OTC_NFT: Assets = { [otc_NFT_AC_Lucid]: 1n };
                console_log(0, this._Entity.className(), `Create OTC Tx - valueFor_Mint_OTC_NFT: ${showData(valueFor_Mint_OTC_NFT)}`);
                //--------------------------------------
                const valueFor_Mint_OTC_ID: Assets = { [otc_ID_AC_Lucid]: 1n };
                console_log(0, this._Entity.className(), `Create OTC Tx - valueFor_Mint_OTC_ID: ${showData(valueFor_Mint_OTC_ID)}`);
                //--------------------------------------
                const lockToken_AC_Lucid = od_token_policy_id + od_token_tn;
                const lockTokenValue: Assets = { [lockToken_AC_Lucid]: BigInt(od_token_amount) };
                //--------------------------------------
                const mayz_AC_Lucid = protocol.pd_mayz_policy_id + protocol.pd_mayz_tn;
                const mayzValue: Assets = { [mayz_AC_Lucid]: BigInt(protocol.pd_mayz_deposit_requirement) };
                //--------------------------------------
                let valueFor_User_Out: Assets = valueFor_Mint_OTC_NFT;
                const minADA_For_User_Out = bigIntMax(calculateMinAdaOfUTxO({ assets: valueFor_User_Out }), ADA_THRESHOLD);
                const value_MinADA_For_User_Out: Assets = { lovelace: minADA_For_User_Out };
                valueFor_User_Out = addAssetsList([value_MinADA_For_User_Out, valueFor_User_Out]);
                console_log(0, this._Entity.className(), `Create OTC - valueFor_User_Out: ${showData(valueFor_User_Out, false)}`);
                //--------------------------------------
                let valueFor_OtcDatum_Out: Assets = addAssetsList([lockTokenValue, valueFor_Mint_OTC_ID, mayzValue]);
                // const minADA_For_OtcDatum = calculateMinAdaOfUTxO({ datum: otcDatum_Out_Hex_ForCalcMinADA, assets: valueFor_OtcDatum_Out });
                const minADA_For_OtcDatum = 100_000_000n; //Ada threshold for nft-script, it would be returned when it is closed
                const value_MinAda_For_OtcDatum: Assets = { lovelace: minADA_For_OtcDatum };
                valueFor_OtcDatum_Out = addAssetsList([value_MinAda_For_OtcDatum, valueFor_OtcDatum_Out]);
                console_log(0, this._Entity.className(), `Create OTC Tx - valueFor_OtcDatum_Out: ${showData(valueFor_OtcDatum_Out, false)}`);
                //--------------------------------------
                const otcDatum_Out = this._BackEndApplied.mkNew_OTCDatum(txParams, minADA_For_OtcDatum, protocol, creator, otc_NFT_Policy_CS, otc_NFT_TN);
                console_log(0, this._Entity.className(), `Create OTC Tx - otcDatum_Out: ${showData(otcDatum_Out, false)}`);
                const otcDatum_Out_Hex = OTCEntity.datumToCborHex(otcDatum_Out);
                console_log(0, this._Entity.className(), `Create OTC Tx - otcDatum_Out_Hex: ${showData(otcDatum_Out_Hex, false)}`);
                //--------------------------------------
                const otcValidatorRedeemerCreateOTC = new CreateOTC();
                console_log(0, this._Entity.className(), `Create OTC Tx - otcValidatorRedeemerCreateOTC: ${showData(otcValidatorRedeemerCreateOTC, false)}`);
                const otcValidatorRedeemerCreateOTC_Hex = objToCborHex(otcValidatorRedeemerCreateOTC);
                console_log(0, this._Entity.className(), `Create OTC Tx - otcValidatorRedeemerCreateOTC_Hex: ${showData(otcValidatorRedeemerCreateOTC_Hex, false)}`);
                //--------------------------------------
                const otcNFTPolicyRedeemerMint = new MintNFT();
                console_log(0, this._Entity.className(), `Create OTC Tx - otcNFTPolicyRedeemerMint: ${showData(otcNFTPolicyRedeemerMint, false)}`);
                const otcNFTPolicyRedeemerMint_Hex = objToCborHex(otcNFTPolicyRedeemerMint);
                console_log(0, this._Entity.className(), `Create OTC Tx - otcNFTPolicyRedeemerMint_Hex: ${showData(otcNFTPolicyRedeemerMint_Hex, false)}`);
                //--------------------------------------
                let { from, until } = await TimeBackEnd.getTxTimeRange();
                //--------------------------------------
                const flomSlot = lucid.unixTimeToSlot(from);
                const untilSlot = lucid.unixTimeToSlot(until);
                //--------------------------------------
                console_log(
                    0,
                    this._Entity.className(),
                    `Create OTC Tx - currentSlot: ${lucid.currentSlot()} - from ${from} to ${until} - from ${convertMillisToTime(from)} to ${convertMillisToTime(
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
                        type: TxEnums.OTC_CREATE,
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
                        .readFrom([protocol_UTxO])
                        .collectFrom([uTxOsAtWalletForMinting])
                        .attach.MintingPolicy(otcNFTScript)
                        .mintAssets(valueFor_Mint_OTC_ID, otcValidatorRedeemerCreateOTC_Hex)
                        .mintAssets(valueFor_Mint_OTC_NFT, otcNFTPolicyRedeemerMint_Hex)
                        .pay.ToAddressWithData(otcValidator_Address, { kind: 'inline', value: otcDatum_Out_Hex }, valueFor_OtcDatum_Out, otcNFTScript)
                        .pay.ToAddress(walletTxParams.address, valueFor_User_Out)
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
                    console_log(0, this._Entity.className(), `Create OTC Tx - Tx Resources: ${showData({ redeemers: resources.redeemersLogs, tx: resources.tx })}`);
                    //--------------------------------------
                    const transactionRedeemerCreateOTC: TransactionRedeemer = {
                        tx_index: 0,
                        purpose: 'mint',
                        redeemerObj: otcValidatorRedeemerCreateOTC,
                        unit_mem: resources.redeemers[0]?.MEM,
                        unit_steps: resources.redeemers[0]?.CPU,
                    };
                    const transactionRedeemerMint: TransactionRedeemer = {
                        tx_index: 1,
                        purpose: 'mint',
                        redeemerObj: otcNFTPolicyRedeemerMint,
                        unit_mem: resources.redeemers[1]?.MEM,
                        unit_steps: resources.redeemers[1]?.CPU,
                    };
                    const transactionOtcDatum_Out: TransactionDatum = {
                        address: otcValidator_Address,
                        datumType: OTCEntity.className(),
                        datumObj: otcDatum_Out,
                    };
                    //--------------------------------------
                    await TransactionBackEndApplied.setPendingTransaction(transaction, {
                        hash: txHash,
                        ids: { protocol_id: protocol._DB_id },
                        redeemers: { CreateOTC: transactionRedeemerCreateOTC, MintNFT: transactionRedeemerMint },
                        datums: { otcDatum_Out: transactionOtcDatum_Out },
                        reading_UTxOs: [],
                        consuming_UTxOs: [uTxOsAtWalletForMinting],
                        unit_mem: resources.tx[0]?.MEM,
                        unit_steps: resources.tx[0]?.CPU,
                        fee: resources.tx[0]?.FEE,
                        size: resources.tx[0]?.SIZE,
                        CBORHex: txCborHex,
                    });
                    //--------------------------------------
                    console_log(-1, this._Entity.className(), `Create OTC Tx - txCborHex: ${showData(txCborHex)}`);
                    return res.status(200).json({ txHash, txCborHex });
                } catch (error) {
                    if (transaction !== undefined) {
                        await TransactionBackEndApplied.setFailedTransaction(transaction, { error, walletInfo: walletTxParams, txInfo: txParams });
                    }
                    throw error;
                }
            } catch (error) {
                console_error(-1, this._Entity.className(), `Create OTC Tx - Error: ${error}`);
                return res.status(500).json({ error: `An error occurred while creating the Create OTC Tx: ${error}` });
            }
        } else {
            console_error(-1, this._Entity.className(), `Create OTC Tx - Error: Method not allowed`);
            return res.status(405).json({ error: `Method not allowed` });
        }
    }

    public static async claimTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
        // Checks if the HTTP method is POST to handle the claimal transaction
        if (req.method === 'POST') {
            console_log(1, this._Entity.className(), `Claim OTC Tx - POST - Init`);
            try {
                //-------------------------
                // Sanitizes the incoming request body to prevent potential database-related security issues
                const sanitizedBody = sanitizeForDatabase(req.body);
                //-------------------------
                // Destructures `walletTxParams` and `txParams` from the sanitized request body
                const {
                    walletTxParams,
                    txParams,
                }: {
                    walletTxParams: WalletTxParams;
                    txParams: ClaimOTCTxParams;
                } = sanitizedBody;
                //-------------------------
                // Logs the transaction parameters for debugging
                //--------------------------------------
                console_log(0, this._Entity.className(), `Claim OTC Tx - walletTxParams: ${showData(walletTxParams)}`);
                //--------------------------------------
                try {
                    const validTxParams = await ClaimOtcTxParamsSchema.validate(txParams, { abortEarly: false });
                    console_log(0, this._Entity.className(), `Claim OTC Tx - txParams: ${showData(validTxParams)}`);
                } catch (error) {
                    if (error instanceof yup.ValidationError) {
                        throw new Error(`Validation failed: ${error.errors.join(', ')}`);
                    }
                    throw error;
                }
                //--------------------------------------
                // Prepares the Lucid instance for transaction processing
                const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);
                //--------------------------------------
                walletTxParams.utxos = fixUTxOList(walletTxParams?.utxos ?? []);
                //--------------------------------------
                const { utxos: uTxOsAtWallet, address } = walletTxParams;
                //--------------------------------------
                // Extracts specific parameters required for processing the transaction
                const { otcDbId } = txParams;
                //--------------------------------------
                const protocol = await ProtocolBackEndApplied.getById_<ProtocolEntity>(txParams.protocol_id, {
                    ...optionsGetMinimalWithSmartUTxOCompleteFields,
                    fieldsForSelect: {},
                });
                if (protocol === undefined) {
                    throw `Invalid protocol id`;
                }
                //--------------------------------------
                const protocol_SmartUTxO = protocol.smartUTxO;
                if (protocol_SmartUTxO === undefined) {
                    throw `Can't find Protocol UTxO`;
                }
                //--------------------------------------
                const protocol_UTxO = protocol_SmartUTxO.getUTxO();
                //--------------------------------------
                // Retrieves the OTC associated with the transaction based on the provided ID
                const otc = await this._BackEndApplied.getById_<OTCEntity>(otcDbId, {
                    ...optionsGetMinimalWithSmartUTxOCompleteFields,
                    fieldsForSelect: {},
                });
                // Throws an error if the OTC is not found
                if (otc === undefined) {
                    throw `Invalid OTC id`;
                }
                //--------------------------------------
                // Checks that the OTC has an associated smart UTxO and is available for consumption
                const OTC_SmartUTxO = otc.smartUTxO;
                if (OTC_SmartUTxO === undefined) {
                    throw `Can't find OTC UTxO`;
                }
                //--------------------------------------------------
                if (OTC_SmartUTxO.scriptRef === null || OTC_SmartUTxO.scriptRef === undefined) {
                    throw `otcNFTScript is undefined`;
                }
                //--------------------------------------------------
                // Gets the UTxO associated with the OTC
                const OTC_UTxO = OTC_SmartUTxO.getUTxO();
                //--------------------------------------------------
                const otcValidator_Address: Address = otc.getNet_Address();
                const otcNFTScript = OTC_SmartUTxO.scriptRef;
                //--------------------------------------------------
                const otcDatum_In = otc.getMyDatum() as OTCDatum;
                console_log(0, this._Entity.className(), `Claim OTC Tx - otcDatum_In: ${showData(otcDatum_In, false)}`);
                const otcDatum_In_Hex = OTCEntity.datumToCborHex(otcDatum_In);
                console_log(0, this._Entity.className(), `Claim OTC Tx - otcDatum_In_Hex: ${showData(otcDatum_In_Hex, false)}`);
                //--------------------------------------
                const otcDatum_Out = this._BackEndApplied.mkClaim_OTCDatum(otcDatum_In);
                console_log(0, this._Entity.className(), `Claim OTC Tx - otcDatum_Out: ${showData(otcDatum_Out, false)}`);
                const otcDatum_Out_Hex = OTCEntity.datumToCborHex(otcDatum_Out);
                console_log(0, this._Entity.className(), `Claim OTC Tx - otcDatum_Out_Hex: ${showData(otcDatum_Out_Hex, false)}`);
                //--------------------------------------
                // Constructs asset values
                //--------------------------------------
                const value_Of_OtcDatum_In = OTC_SmartUTxO.assets;
                console_log(0, this._Entity.className(), `Claim OTC Tx - valueFor_OtcDatum_In: ${showData(value_Of_OtcDatum_In, false)}`);
                //--------------------------------------
                const lockTokenAC = otc.od_token_policy_id + otc.od_token_tn;
                const lockTokenValue: Assets = { [lockTokenAC]: otc.od_token_amount };
                //--------------------------------------
                console_log(0, this._Entity.className(), `Claim OTC Tx -valueFor_LockToken: ${showData(lockTokenValue)}`);
                //--------------------------------------
                const otcID_AC = otc.getNET_id_CS() + strToHex(otc.getNET_id_TN_Str());
                const otcID_Value: Assets = { [otcID_AC]: 1n };
                //--------------------------------------
                const otcNFT_AC = otc.od_otc_nft_policy_id + otc.od_otc_nft_tn;
                const otcNFT_Value: Assets = { [otcNFT_AC]: 1n };
                //--------------------------------------
                const mayzAC = otc.od_mayz_policy_id + otc.od_mayz_tn;
                const mayzValue: Assets = { [mayzAC]: otc.od_mayz_locked };
                //--------------------------------------
                const minAdaValue: Assets = {
                    lovelace: otc.od_min_ada,
                };
                //--------------------------------------
                const valueFor_OtcDatum_Out: Assets = addAssetsList([otcID_Value, otcNFT_Value, mayzValue, minAdaValue]);
                console_log(0, this._Entity.className(), `Claim OTC Tx - valueFor_OtcDatum_Out: ${showData(valueFor_OtcDatum_Out, false)}`);
                //--------------------------------------
                // Creates a redeemer for the validator and converts it to CBOR format for transaction claimal
                const OTCValidatorRedeemerClaim = new ClaimOTC();
                console_log(0, this._Entity.className(), `Claim OTC Tx -OTCValidatorRedeemerclaim: ${showData(OTCValidatorRedeemerClaim, false)}`);
                const OTCValidatorRedeemerClaim_Hex = objToCborHex(OTCValidatorRedeemerClaim);
                console_log(0, this._Entity.className(), `Claim OTC Tx -OTCValidatorRedeemerclaim_Hex: ${showData(OTCValidatorRedeemerClaim_Hex, false)}`);
                //--------------------------------------
                // Sets the transaction time range and logs it
                let { from, until } = await TimeBackEnd.getTxTimeRange();
                //--------------------------------------
                const flomSlot = lucid.unixTimeToSlot(from);
                const untilSlot = lucid.unixTimeToSlot(until);
                //--------------------------------------
                console_log(
                    0,
                    this._Entity.className(),
                    `Claim OTC Tx - currentSlot: ${lucid.currentSlot()} - from ${from} to ${until} - from ${convertMillisToTime(from)} to ${convertMillisToTime(
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
                        type: TxEnums.OTC_CLAIM,
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
                        .readFrom([protocol_UTxO])
                        .collectFrom([OTC_UTxO], OTCValidatorRedeemerClaim_Hex)
                        .pay.ToAddressWithData(otcValidator_Address, { kind: 'inline', value: otcDatum_Out_Hex }, valueFor_OtcDatum_Out, otcNFTScript)
                        .pay.ToAddress(address, lockTokenValue)
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
                    console_log(0, this._Entity.className(), `Create OTC Tx - Tx Resources: ${showData({ redeemers: resources.redeemersLogs, tx: resources.tx })}`);
                    //--------------------------------------
                    const transactionRedeemerClaimOTC: TransactionRedeemer = {
                        tx_index: 0,
                        purpose: 'mint',
                        redeemerObj: OTCValidatorRedeemerClaim,
                        unit_mem: resources.redeemers[0]?.MEM,
                        unit_steps: resources.redeemers[0]?.CPU,
                    };
                    const transactionOtcDatum_In: TransactionDatum = {
                        address: otcValidator_Address,
                        datumType: OTCEntity.className(),
                        datumObj: otcDatum_In,
                    };
                    const transactionOtcDatum_Out: TransactionDatum = {
                        address: otcValidator_Address,
                        datumType: OTCEntity.className(),
                        datumObj: otcDatum_Out,
                    };
                    //--------------------------------------
                    await TransactionBackEndApplied.setPendingTransaction(transaction, {
                        hash: txHash,
                        ids: { protocol_id: protocol._DB_id, otc_id: otcDbId },
                        redeemers: {
                            otcValidatorRedeemerDatumClaim: transactionRedeemerClaimOTC,
                        },
                        datums: { otcDatum_In: transactionOtcDatum_In, otcDatum_Out: transactionOtcDatum_Out },
                        reading_UTxOs: [protocol_UTxO],
                        consuming_UTxOs: [OTC_UTxO],
                        unit_mem: resources.tx[0]?.MEM,
                        unit_steps: resources.tx[0]?.CPU,
                        fee: resources.tx[0]?.FEE,
                        size: resources.tx[0]?.SIZE,
                        CBORHex: txCborHex,
                    });
                    //--------------------------------------
                    console_log(-1, this._Entity.className(), `Claim OTC Tx - txCborHex: ${showData(txCborHex)}`);
                    return res.status(200).json({ txHash, txCborHex });
                } catch (error) {
                    if (transaction !== undefined) {
                        await TransactionBackEndApplied.setFailedTransaction(transaction, { error, walletInfo: walletTxParams, txInfo: txParams });
                    }
                    throw error;
                }
            } catch (error) {
                // Logs any errors encountered and sends a 500 response with the error message
                console_error(-1, this._Entity.className(), `Claim OTC Tx -Error: ${error}`);
                return res.status(500).json({
                    error: `An error occurred while creating the ${this._Entity.apiRoute()} claim Tx: ${error}`,
                });
            }
        } else {
            // Handles unsupported HTTP methods with a 405 response
            console_error(-1, this._Entity.className(), `Claim OTC Tx -Error: Method not allowed`);
            return res.status(405).json({ error: `Method not allowed` });
        }
    }

    public static async closeTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
        if (req.method === 'POST') {
            console_log(1, this._Entity.className(), `Close OTC Tx - POST - Init`);
            try {
                //-------------------------
                // Sanitizes the incoming request body to prevent potential database-related security issues
                const sanitizedBody = sanitizeForDatabase(req.body);
                //-------------------------
                // Destructures `walletTxParams` and `txParams` from the sanitized request body
                const {
                    walletTxParams,
                    txParams,
                }: {
                    walletTxParams: WalletTxParams;
                    txParams: CloseOTCTxParams;
                } = sanitizedBody;
                //-------------------------
                // Logs the transaction parameters for debugging
                //--------------------------------------
                console_log(0, this._Entity.className(), `Close OTC Tx - walletTxParams: ${showData(walletTxParams)}`);
                //--------------------------------------
                try {
                    const validTxParams = await CloseOtcTxParamsSchema.validate(txParams, { abortEarly: false });
                    console_log(0, this._Entity.className(), `Close OTC Tx - txParams: ${showData(validTxParams)}`);
                } catch (error) {
                    if (error instanceof yup.ValidationError) {
                        throw new Error(`Validation failed: ${error.errors.join(', ')}`);
                    }
                    throw error;
                }
                //--------------------------------------
                // Prepares the Lucid instance for transaction processing
                const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);
                //--------------------------------------
                walletTxParams.utxos = fixUTxOList(walletTxParams?.utxos ?? []);
                //--------------------------------------
                const { utxos: uTxOsAtWallet, address } = walletTxParams;
                //--------------------------------------
                // Extracts specific parameters required for processing the transaction
                const { otcDbId } = txParams;
                //--------------------------------------
                const protocol = await ProtocolBackEndApplied.getById_<ProtocolEntity>(txParams.protocol_id, {
                    ...optionsGetMinimalWithSmartUTxOCompleteFields,
                    fieldsForSelect: {},
                });
                if (protocol === undefined) {
                    throw `Invalid protocol id`;
                }
                //--------------------------------------
                const protocol_SmartUTxO = protocol.smartUTxO;
                if (protocol_SmartUTxO === undefined) {
                    throw `Can't find Protocol UTxO`;
                }
                //--------------------------------------
                const protocol_UTxO = protocol_SmartUTxO.getUTxO();
                //--------------------------------------
                // Retrieves the OTC associated with the transaction based on the provided ID
                const otc = await this._BackEndApplied.getById_<OTCEntity>(otcDbId, {
                    ...optionsGetMinimalWithSmartUTxOCompleteFields,
                    fieldsForSelect: {},
                });
                // Throws an error if the OTC is not found
                if (otc === undefined) {
                    throw `Invalid OTC id`;
                }
                //--------------------------------------
                // Checks that the OTC has an associated smart UTxO and is available for consumption
                const OTC_SmartUTxO = otc.smartUTxO;
                if (OTC_SmartUTxO === undefined) {
                    throw `Can't find OTC UTxO`;
                }
                //--------------------------------------------------
                if (OTC_SmartUTxO.scriptRef === null || OTC_SmartUTxO.scriptRef === undefined) {
                    throw `otcNFTScript is undefined`;
                }
                //-----------------------------------
                // Gets the UTxO associated with the OTC
                const OTC_UTxO = OTC_SmartUTxO.getUTxO();
                //-----------------------------------
                const otcValidator_Address: Address = otc.getNet_Address();
                const otcNFTScript = OTC_SmartUTxO.scriptRef;
                //--------------------------------------------------
                console_log(0, this._Entity.className(), `Close OTC Tx - otcNFTScript: ${showData(otcNFTScript, false)}`);
                //--------------------------------------------------
                const otcDatum_In = otc.getMyDatum() as OTCDatum;
                console_log(0, this._Entity.className(), `Close OTC Tx - otcDatum_In: ${showData(otcDatum_In, false)}`);
                const otcDatum_In_Hex = OTCEntity.datumToCborHex(otcDatum_In);
                console_log(0, this._Entity.className(), `Close OTC Tx - otcDatum_In_Hex: ${showData(otcDatum_In_Hex, false)}`);
                //--------------------------------------
                // Constructs asset values
                //--------------------------------------
                const otcID_AC = otc.getNET_id_CS() + strToHex(otc.getNET_id_TN_Str());
                const otcID_toBurnValue: Assets = { [otcID_AC]: -1n };
                //--------------------------------------
                const otcNFT_AC = otc.od_otc_nft_policy_id + otc.od_otc_nft_tn;
                const otcNFT_toBurnValue: Assets = { [otcNFT_AC]: -1n };
                //--------------------------------------
                const mayzAC = otc.od_mayz_policy_id + otc.od_mayz_tn;
                const mayzValue: Assets = { [mayzAC]: otc.od_mayz_locked };
                //--------------------------------------
                // Add additional values to the transaction, including minimum ADA requirement
                let valueForGetBackToUser = mayzValue;
                const minAdaValue: Assets = {
                    lovelace: otc.od_min_ada,
                };
                valueForGetBackToUser = addAssetsList([minAdaValue, valueForGetBackToUser]);
                console_log(0, this._Entity.className(), `Close OTC Tx - value to users: ${showData(valueForGetBackToUser, false)}`);
                //-----------------------------------
                // Creates a redeemer for the validator and converts it to CBOR format for transaction closeal
                const otcValidatorRedeemerCloseOTC = new CloseOTC();
                console_log(0, this._Entity.className(), `Close OTC Tx - otcValidatorRedeemerCloseOTC: ${showData(otcValidatorRedeemerCloseOTC, false)}`);
                const otcValidatorRedeemerCloseOTC_Hex = objToCborHex(otcValidatorRedeemerCloseOTC);
                console_log(0, this._Entity.className(), `Close OTC Tx - otcValidatorRedeemerCloseOTC_Hex: ${showData(otcValidatorRedeemerCloseOTC_Hex, false)}`);
                //--------------------------------------
                const otcNFTPolicyRedeemerBurnNFT = new BurnNFT();
                console_log(0, this._Entity.className(), `Close OTC Tx - otcNFTPolicyRedeemerBurnNFT: ${showData(otcNFTPolicyRedeemerBurnNFT, false)}`);
                const otcNFTPolicyRedeemerBurnNFT_Hex = objToCborHex(otcNFTPolicyRedeemerBurnNFT);
                console_log(0, this._Entity.className(), `Close OTC Tx - otcNFTPolicyRedeemerBurnNFT_Hex: ${showData(otcNFTPolicyRedeemerBurnNFT_Hex, false)}`);
                //--------------------------------------
                // Sets the transaction time range and logs it
                let { from, until } = await TimeBackEnd.getTxTimeRange();
                //--------------------------------------
                const flomSlot = lucid.unixTimeToSlot(from);
                const untilSlot = lucid.unixTimeToSlot(until);
                //--------------------------------------
                console_log(
                    0,
                    this._Entity.className(),
                    `Close OTC Tx - currentSlot: ${lucid.currentSlot()} - from ${from} to ${until} - from ${convertMillisToTime(from)} to ${convertMillisToTime(
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
                        type: TxEnums.OTC_CLOSE,
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
                    console_log(0, this._Entity.className(), `Close OTC Tx - UTxO value: ${showData(OTC_UTxO.assets, false)}`);

                    tx = tx
                        .readFrom([protocol_UTxO])
                        .attach.MintingPolicy(otcNFTScript)
                        .collectFrom([OTC_UTxO], otcValidatorRedeemerCloseOTC_Hex)
                        .mintAssets(otcID_toBurnValue, otcValidatorRedeemerCloseOTC_Hex)
                        .mintAssets(otcNFT_toBurnValue, otcNFTPolicyRedeemerBurnNFT_Hex)
                        .pay.ToAddress(address, valueForGetBackToUser)
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
                    console_log(0, this._Entity.className(), `Close OTC Tx - Tx Resources: ${showData({ redeemers: resources.redeemersLogs, tx: resources.tx })}`);
                    const transactionOtcValidatorRedeemerCloseOTC: TransactionRedeemer = {
                        tx_index: 0,
                        purpose: 'spend',
                        redeemerObj: otcValidatorRedeemerCloseOTC,
                        unit_mem: resources.redeemers[0]?.MEM,
                        unit_steps: resources.redeemers[0]?.CPU,
                    };
                    const transactionOtcPolicyRedeemerCloseOTC: TransactionRedeemer = {
                        tx_index: 0,
                        purpose: 'burn',
                        redeemerObj: otcValidatorRedeemerCloseOTC,
                        unit_mem: resources.redeemers[1]?.MEM,
                        unit_steps: resources.redeemers[1]?.CPU,
                    };
                    const transactionotcNFTPolicyRedeemerBurnNFT: TransactionRedeemer = {
                        tx_index: 2,
                        purpose: 'burn',
                        redeemerObj: otcNFTPolicyRedeemerBurnNFT,
                        unit_mem: resources.redeemers[2]?.MEM,
                        unit_steps: resources.redeemers[2]?.CPU,
                    };
                    const transactionOtcDatum_In: TransactionDatum = {
                        address: otcValidator_Address,
                        datumType: OTCEntity.className(),
                        datumObj: otcDatum_In,
                    };
                    //--------------------------------------
                    await TransactionBackEndApplied.setPendingTransaction(transaction, {
                        hash: txHash,
                        ids: { protocol_id: protocol._DB_id, otc_id: otcDbId },
                        redeemers: {
                            CloseOTC: transactionOtcValidatorRedeemerCloseOTC,
                            BurnNFT: transactionotcNFTPolicyRedeemerBurnNFT,
                            BurnID: transactionOtcPolicyRedeemerCloseOTC,
                        },
                        datums: { otcDatum_In: transactionOtcDatum_In },
                        reading_UTxOs: [protocol_UTxO],
                        consuming_UTxOs: [OTC_UTxO],
                        unit_mem: resources.tx[0]?.MEM,
                        unit_steps: resources.tx[0]?.CPU,
                        fee: resources.tx[0]?.FEE,
                        size: resources.tx[0]?.SIZE,
                        CBORHex: txCborHex,
                    });
                    //--------------------------------------
                    console_log(-1, this._Entity.className(), `Close OTC Tx - txCborHex: ${showData(txCborHex)}`);
                    return res.status(200).json({ txHash, txCborHex });
                } catch (error) {
                    if (transaction !== undefined) {
                        await TransactionBackEndApplied.setFailedTransaction(transaction, { error, walletInfo: walletTxParams, txInfo: txParams });
                    }
                    throw error;
                }
            } catch (error) {
                // Logs any errors encountered and sends a 500 response with the error message
                console_error(-1, this._Entity.className(), `Close OTC Tx -Error: ${error}`);
                return res.status(500).json({
                    error: `An error occurred while creating the ${this._Entity.apiRoute()} close Tx: ${error}`,
                });
            }
        } else {
            // Handles unsupported HTTP methods with a 405 response
            console_error(-1, this._Entity.className(), `Close OTC Tx -Error: Method not allowed`);
            return res.status(405).json({ error: `Method not allowed` });
        }
    }

    public static async cancelTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
        if (req.method === 'POST') {
            console_log(1, this._Entity.className(), `Close OTC Tx - POST - Init`);
            try {
                //-------------------------
                // Sanitizes the incoming request body to prevent potential database-related security issues
                const sanitizedBody = sanitizeForDatabase(req.body);
                //-------------------------
                // Destructures `walletTxParams` and `txParams` from the sanitized request body
                const {
                    walletTxParams,
                    txParams,
                }: {
                    walletTxParams: WalletTxParams;
                    txParams: CancelOTCTxParams;
                } = sanitizedBody;
                //-------------------------
                // Logs the transaction parameters for debugging
                //--------------------------------------
                console_log(0, this._Entity.className(), `Cancel OTC Tx - walletTxParams: ${showData(walletTxParams)}`);
                //--------------------------------------
                try {
                    const validTxParams = await CancelOtcTxParamsSchema.validate(txParams, { abortEarly: false });
                    console_log(0, this._Entity.className(), `Cancel OTC Tx - txParams: ${showData(validTxParams)}`);
                } catch (error) {
                    if (error instanceof yup.ValidationError) {
                        throw new Error(`Validation failed: ${error.errors.join(', ')}`);
                    }
                    throw error;
                }
                //--------------------------------------
                // Prepares the Lucid instance for transaction processing
                const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);
                //--------------------------------------
                walletTxParams.utxos = fixUTxOList(walletTxParams?.utxos ?? []);
                //--------------------------------------
                const { utxos: uTxOsAtWallet, address } = walletTxParams;
                //--------------------------------------
                // Extracts specific parameters required for processing the transaction
                const { otcDbId } = txParams;
                //--------------------------------------
                const protocol = await ProtocolBackEndApplied.getById_<ProtocolEntity>(txParams.protocol_id, {
                    ...optionsGetMinimalWithSmartUTxOCompleteFields,
                    fieldsForSelect: {},
                });
                if (protocol === undefined) {
                    throw `Invalid protocol id`;
                }
                //--------------------------------------
                const protocol_SmartUTxO = protocol.smartUTxO;
                if (protocol_SmartUTxO === undefined) {
                    throw `Can't find Protocol UTxO`;
                }
                //--------------------------------------
                const protocol_UTxO = protocol_SmartUTxO.getUTxO();
                //--------------------------------------
                // Retrieves the OTC associated with the transaction based on the provided ID
                const otc = await this._BackEndApplied.getById_<OTCEntity>(otcDbId, {
                    ...optionsGetMinimalWithSmartUTxOCompleteFields,
                    fieldsForSelect: {},
                });
                // Throws an error if the OTC is not found
                if (otc === undefined) {
                    throw `Invalid OTC id`;
                }
                //--------------------------------------
                // Checks that the OTC has an associated smart UTxO and is available for consumption
                const OTC_SmartUTxO = otc.smartUTxO;
                if (OTC_SmartUTxO === undefined) {
                    throw `Can't find OTC UTxO`;
                }
                //--------------------------------------------------
                if (OTC_SmartUTxO.scriptRef === null || OTC_SmartUTxO.scriptRef === undefined) {
                    throw `otcNFTScript is undefined`;
                }
                //--------------------------------------------------
                // Gets the UTxO associated with the OTC
                const OTC_UTxO = OTC_SmartUTxO.getUTxO();
                //--------------------------------------------------
                const otcValidator_Address: Address = otc.getNet_Address();
                const otcNFTScript = OTC_SmartUTxO.scriptRef;
                //--------------------------------------------------
                const otcDatum_In = otc.getMyDatum() as OTCDatum;
                console_log(0, this._Entity.className(), `Cancel OTC Tx - otcDatum_In: ${showData(otcDatum_In, false)}`);
                const otcDatum_In_Hex = OTCEntity.datumToCborHex(otcDatum_In);
                console_log(0, this._Entity.className(), `Cancel OTC Tx - otcDatum_In_Hex: ${showData(otcDatum_In_Hex, false)}`);
                //--------------------------------------
                // Constructs asset values
                //--------------------------------------
                const otcID_AC = otc.getNET_id_CS() + strToHex(otc.getNET_id_TN_Str());
                const otcID_toBurnValue: Assets = { [otcID_AC]: -1n };
                //--------------------------------------
                const otcNFT_AC = otc.od_otc_nft_policy_id + otc.od_otc_nft_tn;
                const otcNFT_toBurnValue: Assets = { [otcNFT_AC]: -1n };
                //--------------------------------------
                const mayzAC = otc.od_mayz_policy_id + otc.od_mayz_tn;
                const mayzValue: Assets = { [mayzAC]: otc.od_mayz_locked };
                //--------------------------------------
                const lockTokenAC = otc.od_token_policy_id + otc.od_token_tn;
                const lockTokenValue: Assets = { [lockTokenAC]: otc.od_token_amount };
                //--------------------------------------
                // Add additional values to the transaction, including minimum ADA requirement
                let valueForGetBackToUser = mayzValue;
                const minAdaValue: Assets = {
                    lovelace: otc.od_min_ada,
                };
                valueForGetBackToUser = addAssetsList([minAdaValue, valueForGetBackToUser]);
                valueForGetBackToUser = addAssetsList([lockTokenValue, valueForGetBackToUser]);
                console_log(0, this._Entity.className(), `Cancel OTC Tx - value to users: ${showData(valueForGetBackToUser, false)}`);
                //-----------------------------------
                // Creates a redeemer for the validator and converts it to CBOR format for transaction cancelal
                const otcValidatorRedeemerCancelOTC = new CancelOTC();
                console_log(0, this._Entity.className(), `Cancel OTC Tx - otcValidatorRedeemerCancelOTC: ${showData(otcValidatorRedeemerCancelOTC, false)}`);
                const otcValidatorRedeemerCancelOTC_Hex = objToCborHex(otcValidatorRedeemerCancelOTC);
                console_log(0, this._Entity.className(), `Cancel OTC Tx - otcValidatorRedeemerCancelOTC_Hex: ${showData(otcValidatorRedeemerCancelOTC_Hex, false)}`);
                //--------------------------------------
                const otcNFTPolicyRedeemerBurnNFT = new BurnNFT();
                console_log(0, this._Entity.className(), `Cancel OTC Tx - otcNFTPolicyRedeemerBurnNFT: ${showData(otcNFTPolicyRedeemerBurnNFT, false)}`);
                const otcNFTPolicyRedeemerBurnNFT_Hex = objToCborHex(otcNFTPolicyRedeemerBurnNFT);
                console_log(0, this._Entity.className(), `Cancel OTC Tx - otcNFTPolicyRedeemerBurnNFT: ${showData(otcNFTPolicyRedeemerBurnNFT_Hex, false)}`);
                //--------------------------------------
                // Sets the transaction time range and logs it
                let { from, until } = await TimeBackEnd.getTxTimeRange();
                //--------------------------------------
                const flomSlot = lucid.unixTimeToSlot(from);
                const untilSlot = lucid.unixTimeToSlot(until);
                //--------------------------------------
                console_log(
                    0,
                    this._Entity.className(),
                    `Cancel OTC Tx - currentSlot: ${lucid.currentSlot()} - from ${from} to ${until} - from ${convertMillisToTime(from)} to ${convertMillisToTime(
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
                        type: TxEnums.OTC_CLOSE,
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
                        .readFrom([protocol_UTxO])
                        .attach.MintingPolicy(otcNFTScript)
                        .collectFrom([OTC_UTxO], otcValidatorRedeemerCancelOTC_Hex)
                        .mintAssets(otcID_toBurnValue, otcValidatorRedeemerCancelOTC_Hex)
                        .mintAssets(otcNFT_toBurnValue, otcNFTPolicyRedeemerBurnNFT_Hex)
                        .pay.ToAddress(address, valueForGetBackToUser)
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
                    console_log(0, this._Entity.className(), `Cancel OTC Tx - Tx Resources: ${showData({ redeemers: resources.redeemersLogs, tx: resources.tx })}`);
                    const transactionOtcValidatorRedeemerCancelOTC: TransactionRedeemer = {
                        tx_index: 0,
                        purpose: 'spend',
                        redeemerObj: otcValidatorRedeemerCancelOTC,
                        unit_mem: resources.redeemers[0]?.MEM,
                        unit_steps: resources.redeemers[0]?.CPU,
                    };
                    const transactionOtcPolicyRedeemerCancelOTC: TransactionRedeemer = {
                        tx_index: 1,
                        purpose: 'burn',
                        redeemerObj: otcValidatorRedeemerCancelOTC,
                        unit_mem: resources.redeemers[1]?.MEM,
                        unit_steps: resources.redeemers[1]?.CPU,
                    };
                    const transactionotcNFTPolicyRedeemerBurnNFT: TransactionRedeemer = {
                        tx_index: 2,
                        purpose: 'burn',
                        redeemerObj: otcNFTPolicyRedeemerBurnNFT,
                        unit_mem: resources.redeemers[2]?.MEM,
                        unit_steps: resources.redeemers[2]?.CPU,
                    };
                    const transactionOtcDatum_In: TransactionDatum = {
                        address: otcValidator_Address,
                        datumType: OTCEntity.className(),
                        datumObj: otcDatum_In,
                    };
                    //--------------------------------------
                    await TransactionBackEndApplied.setPendingTransaction(transaction, {
                        hash: txHash,
                        ids: { protocol_id: protocol._DB_id, otc_id: otcDbId },
                        redeemers: {
                            CancelOTC: transactionOtcValidatorRedeemerCancelOTC,
                            BurnNFT: transactionotcNFTPolicyRedeemerBurnNFT,
                            BurnID: transactionOtcPolicyRedeemerCancelOTC,
                        },
                        datums: { otcDatum_In: transactionOtcDatum_In },
                        reading_UTxOs: [protocol_UTxO],
                        consuming_UTxOs: [OTC_UTxO],
                        unit_mem: resources.tx[0]?.MEM,
                        unit_steps: resources.tx[0]?.CPU,
                        fee: resources.tx[0]?.FEE,
                        size: resources.tx[0]?.SIZE,
                        CBORHex: txCborHex,
                    });
                    //--------------------------------------
                    console_log(-1, this._Entity.className(), `Cancel OTC Tx - txCborHex: ${showData(txCborHex)}`);
                    return res.status(200).json({ txHash, txCborHex });
                } catch (error) {
                    if (transaction !== undefined) {
                        await TransactionBackEndApplied.setFailedTransaction(transaction, { error, walletInfo: walletTxParams, txInfo: txParams });
                    }
                    throw error;
                }
            } catch (error) {
                // Logs any errors encountered and sends a 500 response with the error message
                console_error(-1, this._Entity.className(), `Cancel OTC Tx -Error: ${error}`);
                return res.status(500).json({
                    error: `An error occurred while creating the ${this._Entity.apiRoute()} cancel Tx: ${error}`,
                });
            }
        } else {
            // Handles unsupported HTTP methods with a 405 response
            console_error(-1, this._Entity.className(), `Cancel OTC Tx -Error: Method not allowed`);
            return res.status(405).json({ error: `Method not allowed` });
        }
    }
}

// #endregion custom api handlers
