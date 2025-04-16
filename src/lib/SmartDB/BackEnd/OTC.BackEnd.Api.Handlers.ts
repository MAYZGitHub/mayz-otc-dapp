import { CreateOTCTxParams, CreateOtcTxParamsSchema,  OTC_ID_TN_Str, TxEnums } from '@/utils/constants/on-chain';
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
import { CreateOTC, MintNFT } from '../Entities/Redeemers/OTC.Redeemer';
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

    private static formatWithSeparators(n: bigint, acc: string = ''): string {
        if (n === 0n) {
            return acc;
        } else {
            const currentGroup = n % 1000n;
            // Convert current group to 3 digits with leading zeros if needed
            const groupBytes = this.padNumber(currentGroup);
            let newAcc: string;
            if (acc.length === 0) {
                newAcc = groupBytes;
            } else {
                // Add separator (.) which is 2E in hex
                newAcc = groupBytes + '2e' + acc;
            }
            return this.formatWithSeparators(n / 1000n, newAcc);
        }
    }
    private static padNumber(n: bigint): string {
        const bytes = n.toString();
        const len = bytes.length;

        if (len === 1) {
            // Add "00" prefix
            return strToHex('00' + bytes);
        } else if (len === 2) {
            // Add "0" prefix
            return strToHex('0' + bytes);
        } else {
            return strToHex(bytes);
        }
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
                        // } else if (query[1] === 'claim-tx') {
                        //     return await this.claimTxApiHandler(req, res);
                        // } else if (query[1] === 'close-tx') {
                        //     return await this.closeTxApiHandler(req, res);
                        // } else if (query[1] === 'cancel-tx') {
                        //     return await this.cancelTxApiHandler(req, res);
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
                //--------------------------------------
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
                const otcValidator_Address: Address = protocol.getOTC_Net_Address();
                const protocolValidator_Hash = protocol.fProtocolValidator_Hash;
                const protocolValidator_Script = protocol.fProtocolScript;
                const otcScript = protocol.fOTCScript;
                const otcScriptValidator_Hash = protocol.fOTCValidator_Hash;
                //--------------------------------------
                const otcPolicyID_AC_Lucid = protocol.getOTC_NET_id_CS() + strToHex(OTC_ID_TN_Str);
                //--------------------------------------
                const protocol_SmartUTxO = protocol.smartUTxO;
                if (protocol_SmartUTxO === undefined) {
                    throw `Can't find Protocol UTxO`;
                }
                // if (protocol_SmartUTxO.isAvailableForReading() === false) {
                //     throw `Protocol UTxO is being used, please wait and try again`;
                // }
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
                /// Parameters for the OTC NFT Minting Policys
                // pp_otc_nft_policy_id_tx_out_ref: OutputReference,
                // /// Reference to OTC validator for validation. It's also the OTC ID PolicyID
                // pp_otc_validator_hash: ScriptHash,
                // /// Protocol ID policy ID
                // pp_protocol_policy_id: PolicyId,
                // /// Protocol ID token name
                // pp_protocol_id_tn: ByteArray,
                // /// OTC ID token name
                // pp_otc_id_tn: ByteArray,
                //--------------------------------------
                const pp_otc_nft_policy_id_tx_out_ref = new Constr(0, [uTxOsAtWalletForMinting.txHash, BigInt(uTxOsAtWalletForMinting.outputIndex)]);
                const pp_otc_validator_hash = otcScriptValidator_Hash;
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
                // Generate datum object with relevant sale data and no min ADA yet
                const otcDatum_Out_ForCalcMinADA = this._BackEndApplied.mkNew_OTCDatum(txParams, 0n, protocol, creator, otc_NFT_Policy_CS, otc_NFT_TN);
                const otcDatum_Out_Hex_ForCalcMinADA = OTCEntity.datumToCborHex(otcDatum_Out_ForCalcMinADA);
                //--------------------------------------
                const otc_NFT_AC_Lucid = otc_NFT_Policy_CS + otc_NFT_TN;
                //--------------------------------------
                const valueFor_Mint_OTC_NFT: Assets = { [otc_NFT_AC_Lucid]: 1n };
                console_log(0, this._Entity.className(), `Create OTC Tx - valueFor_Mint_OTC_NFT: ${showData(valueFor_Mint_OTC_NFT)}`);
                //--------------------------------------
                const valueFor_Mint_OTC_ID: Assets = { [otcPolicyID_AC_Lucid]: 1n };
                console_log(0, this._Entity.className(), `Create OTC Tx - valueFor_Mint_OTC_ID: ${showData(valueFor_Mint_OTC_ID)}`);
                //--------------------------------------
                const lockToken_AC_Lucid = od_token_policy_id + od_token_tn;
                const lockTokenValue: Assets = { [lockToken_AC_Lucid]: BigInt(od_token_amount) };
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
                const minADA_For_OtcDatum = 100_000_000n
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
                if (flomSlot < 0) {
                    from = lucid.currentSlot();
                    from = slotToUnixTime(lucid.config().network!, lucid.currentSlot()) as number; // slot es en segundots
                }
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
                        // .attach.MintingPolicy(otcScript)
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
                        tx_index: 0,
                        purpose: 'mint',
                        redeemerObj: otcNFTPolicyRedeemerMint,
                        unit_mem: resources.redeemers[0]?.MEM,
                        unit_steps: resources.redeemers[0]?.CPU,
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

    // public static async claimTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
    //     // Checks if the HTTP method is POST to handle the claimal transaction
    //     if (req.method === 'POST') {
    //         console_log(1, this._Entity.className(), `claim Tx - POST - Init`);

    //         try {
    //             // Sanitizes the incoming request body to prevent potential database-related security issues
    //             const sanitizedBody = sanitizeForDatabase(req.body);

    //             // Destructures `walletTxParams` and `txParams` from the sanitized request body
    //             const {
    //                 walletTxParams,
    //                 txParams,
    //             }: {
    //                 walletTxParams: WalletTxParams;
    //                 txParams: ClaimOTCTxParams;
    //             } = sanitizedBody;

    //             // Logs the transaction parameters for debugging
    //             console_log(0, this._Entity.className(), `claim Tx - txParams: ${showData(txParams)}`);

    //             // Ensures synchronization of the blockchain with server time if running in emulator mode
    //             if (isEmulator) {
    //                 // Uncomment this line to synchronize the emulator with server time
    //                 // await TimeBackEnd.syncBlockChainWithServerTime()
    //             }

    //             // Prepares the Lucid instance for transaction processing
    //             const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);

    //             // Extracts UTxOs and address from wallet transaction parameters
    //             const { utxos: uTxOsAtWallet, address } = walletTxParams;

    //             // Extracts specific parameters required for processing the transaction
    //             const { otcDbId, validatorAddress, otcScript } = txParams;

    //             // Retrieves the OTC associated with the transaction based on the provided ID
    //             const Otc = await OTCBackEndApplied.getById_<OTCEntity>(otcDbId, {
    //                 ...optionsGetMinimalWithSmartUTxOCompleteFields,
    //             });

    //             // Throws an error if the OTC is not found
    //             if (Otc === undefined) {
    //                 throw `Invalid OTC id`;
    //             }

    //             // Checks that the OTC has an associated smart UTxO and is available for consumption
    //             const OTC_SmartUTxO = Otc.smartUTxO;
    //             if (OTC_SmartUTxO === undefined) {
    //                 throw `Can't find OTC UTxO`;
    //             }
    //             if (OTC_SmartUTxO.unsafeIsAvailableForConsuming() === false) {
    //                 throw `OTC UTxO is being used, please wait and try again`;
    //             }

    //             // Constructs asset values for seller tokens plus ADA and logs it
    //             const lockTokenAC = Otc.od_token_policy_id + strToHex(Otc.od_token_tn);
    //             const lockTokenValue: Assets = { [lockTokenAC]: Otc.od_token_amount };

    //             console_log(0, this._Entity.className(), `claim Tx - valueFor_LockToken: ${showData(lockTokenValue)}`);

    //             // Generate datum object with relevant sale data and no min ADA yet
    //             const datumPlainObject = {
    //                 od_creator: Otc.od_creator,
    //                 od_token_policy_id: Otc.od_token_policy_id,
    //                 od_token_tn: Otc.od_token_tn,
    //                 od_token_amount: Otc.od_token_amount,
    //                 od_otc_nft_policy_id: Otc.od_otc_nft_policy_id,
    //                 od_otc_nft_tn: Otc.od_otc_nft_tn,
    //                 od_mayz_policy_id: Otc.od_mayz_policy_id,
    //                 od_mayz_tn: Otc.od_mayz_tn,
    //                 od_mayz_locked: Otc.od_mayz_locked,
    //                 od_min_ada: Otc.od_min_ada,
    //             };

    //             const policyID_AC = Otc.od_token_policy_id + strToHex(OTC_ID_TN);
    //             const policyID_Value: Assets = { [policyID_AC]: 1n };

    //             let valueForGetBackToContract: Assets = policyID_Value;

    //             const otcNFT_AC = Otc.od_otc_nft_policy_id + strToHex(Otc.od_otc_nft_tn);
    //             const otcNFT_Value: Assets = { [otcNFT_AC]: 1n };

    //             // Add additional values to the transaction, including minimum ADA requirement
    //             valueForGetBackToContract = addAssetsList([otcNFT_Value, valueForGetBackToContract]);

    //             const mayzAC = mayzPolicyId + strToHex(mayzTn);
    //             const mayzValue: Assets = { [otcNFT_AC]: mayzLockAmount };

    //             // Add additional values to the transaction, including minimum ADA requirement
    //             valueForGetBackToContract = addAssetsList([mayzValue, valueForGetBackToContract]);

    //             const minAdaValue: Assets = {
    //                 lovelace: Otc.od_min_ada,
    //             };
    //             valueForGetBackToContract = addAssetsList([minAdaValue, valueForGetBackToContract]);

    //             // Gets the UTxO associated with the OTC
    //             const OTC_UTxO = OTC_SmartUTxO.getUTxO();

    //             // Create and encode the datum for the transaction
    //             let datumOfTx = OTCEntity.mkDatumFromPlainObject(datumPlainObject);
    //             const datumOfTxHex = OTCEntity.datumToCborHex(datumOfTx);

    //             // Creates a redeemer for the validator and converts it to CBOR format for transaction claimal
    //             const OTCValidatorRedeemerclaim = new ClaimOTC();
    //             console_log(0, this._Entity.className(), `claim Tx - OTCValidatorRedeemerclaim: ${showData(OTCValidatorRedeemerclaim, false)}`);
    //             const OTCValidatorRedeemerclaim_Hex = objToCborHex(OTCValidatorRedeemerclaim);
    //             console_log(0, this._Entity.className(), `claim Tx - OTCValidatorRedeemerclaim_Hex: ${showData(OTCValidatorRedeemerclaim_Hex, false)}`);

    //             // Sets the transaction time range and logs it
    //             const { now, from, until } = await TimeBackEnd.getTxTimeRange();
    //             console_log(0, this._Entity.className(), `claim Tx - from ${from} to ${until}`);

    //             // Initializes a new Lucid transaction object
    //             let tx: Tx = lucid.newTx();

    //             // Configures transaction actions: mint, collect, attach policies, and send funds
    //             tx = tx
    //                 .collectFrom([OTC_UTxO], OTCValidatorRedeemerclaim_Hex)
    //                 .attachSpendingValidator(otcScript)
    //                 .payToAddress(address, lockTokenValue)
    //                 .payToContract(validatorAddress, { inline: datumOfTxHex }, valueForGetBackToContract)
    //                 .addSigner(address);

    //             // Completes the transaction preparation
    //             const txComplete = await tx.complete();

    //             // Converts the transaction to CBOR Hex and computes the hash
    //             const txCborHex = txComplete.toString();
    //             const txHash = txComplete.toHash();
    //             console_log(0, this._Entity.className(), `claim Tx - txHash: ${showData(txHash)}`);

    //             // Creates transaction redeemer entities for record-keeping
    //             const transactionOTCValidatorRedeemerclaim: TransactionRedeemer = {
    //                 tx_index: 0,
    //                 purpose: 'spend',
    //                 redeemerObj: OTCValidatorRedeemerclaim,
    //             };

    //             // Defines the input datum for the transaction
    //             const transactionOTCDatum_In: TransactionDatum = {
    //                 address: OTC_SmartUTxO.address,
    //                 datumType: OTCEntity.className(),
    //                 datumObj: OTC_SmartUTxO.datumObj,
    //             };

    //             // Creates and stores a new transaction entity in the backend
    //             const transaction: TransactionEntity = new TransactionEntity({
    //                 paymentPKH: walletTxParams.pkh,
    //                 date: new Date(now),
    //                 type: OTC_CLAIM,
    //                 hash: txHash,
    //                 status: TRANSACTION_STATUS_PENDING,
    //                 ids: {},
    //                 redeemers: {
    //                     OTCValidatorRedeemerclaim: transactionOTCValidatorRedeemerclaim,
    //                 },
    //                 datums: { OTCDatum_In: transactionOTCDatum_In },
    //                 consuming_UTxOs: [OTC_UTxO],
    //             });
    //             await TransactionBackEndApplied.create(transaction);

    //             // Logs the transaction CBOR Hex and returns it in the response
    //             console_log(-1, this._Entity.className(), `claim Tx - txCborHex: ${showData(txCborHex)}`);
    //             return res.status(200).json({ txCborHex, txHash });
    //         } catch (error) {
    //             // Logs any errors encountered and sends a 500 response with the error message
    //             console_error(-1, this._Entity.className(), `claim Tx - Error: ${error}`);
    //             return res.status(500).json({
    //                 error: `An error occurred while creating the ${this._Entity.apiRoute()} claim Tx: ${error}`,
    //             });
    //         }
    //     } else {
    //         // Handles unsupported HTTP methods with a 405 response
    //         console_error(-1, this._Entity.className(), `claim Tx - Error: Method not allowed`);
    //         return res.status(405).json({ error: `Method not allowed` });
    //     }
    // }

    // public static async closeTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
    //     // Checks if the HTTP method is POST to handle the Closeal transaction
    //     if (req.method === 'POST') {
    //         console_log(1, this._Entity.className(), `Close Tx - POST - Init`);

    //         try {
    //             // Sanitizes the incoming request body to prevent potential database-related security issues
    //             const sanitizedBody = sanitizeForDatabase(req.body);

    //             // Destructures `walletTxParams` and `txParams` from the sanitized request body
    //             const {
    //                 walletTxParams,
    //                 txParams,
    //             }: {
    //                 walletTxParams: WalletTxParams;
    //                 txParams: CloseOTCTxParams;
    //             } = sanitizedBody;

    //             // Logs the transaction parameters for debugging
    //             console_log(0, this._Entity.className(), `Close Tx - txParams: ${showData(txParams)}`);

    //             // Ensures synchronization of the blockchain with server time if running in emulator mode
    //             if (isEmulator) {
    //                 // Uncomment this line to synchronize the emulator with server time
    //                 // await TimeBackEnd.syncBlockChainWithServerTime()
    //             }

    //             // Prepares the Lucid instance for transaction processing
    //             const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);

    //             // Extracts UTxOs and address from wallet transaction parameters
    //             const { utxos: uTxOsAtWallet, address } = walletTxParams;

    //             // Extracts specific parameters required for processing the transaction
    //             const { otcDbId, otcScript, mintingOtcNFT } = txParams;

    //             // Retrieves the OTC associated with the transaction based on the provided ID
    //             const Otc = await OTCBackEndApplied.getById_<OTCEntity>(otcDbId, {
    //                 ...optionsGetMinimalWithSmartUTxOCompleteFields,
    //             });

    //             // Throws an error if the OTC is not found
    //             if (Otc === undefined) {
    //                 throw `Invalid OTC id`;
    //             }

    //             // Checks that the OTC has an associated smart UTxO and is available for consumption
    //             const OTC_SmartUTxO = Otc.smartUTxO;
    //             if (OTC_SmartUTxO === undefined) {
    //                 throw `Can't find OTC UTxO`;
    //             }
    //             if (OTC_SmartUTxO.unsafeIsAvailableForConsuming() === false) {
    //                 throw `OTC UTxO is being used, please wait and try again`;
    //             }

    //             const policyID_AC = Otc.od_token_policy_id + strToHex(OTC_ID_TN);
    //             const policyID_toBurnValue: Assets = { [policyID_AC]: -1n };

    //             const otcNFT_AC = Otc.od_otc_nft_policy_id + strToHex(Otc.od_otc_nft_tn);
    //             const otcNFT_toBurnValue: Assets = { [otcNFT_AC]: -1n };

    //             const mayzAC = mayzPolicyId + strToHex(mayzTn);
    //             const mayzValue: Assets = { [mayzAC]: mayzLockAmount };

    //             // Add additional values to the transaction, including minimum ADA requirement
    //             let valueForGetBackToUser = mayzValue;

    //             const minAdaValue: Assets = {
    //                 lovelace: Otc.od_min_ada,
    //             };
    //             valueForGetBackToUser = addAssetsList([minAdaValue, valueForGetBackToUser]);

    //             // Gets the UTxO associated with the OTC
    //             const OTC_UTxO = OTC_SmartUTxO.getUTxO();

    //             // Create minting policy and redeemers for the sale transaction
    //             const otcNftBurnRedeemer = new BurnNFT();
    //             const otcNftBurnRedeemerHex = objToCborHex(otcNftBurnRedeemer);

    //             // Create minting policy and redeemers for the sale transaction
    //             const OTCValidatorRedeemerClose = new CloseOTC();
    //             const otcPolicyIdBurnRedeemerCloseHex = objToCborHex(OTCValidatorRedeemerClose);

    //             // Sets the transaction time range and logs it
    //             const { now, from, until } = await TimeBackEnd.getTxTimeRange();
    //             console_log(0, this._Entity.className(), `Close Tx - from ${from} to ${until}`);

    //             // Initializes a new Lucid transaction object
    //             let tx: Tx = lucid.newTx();

    //             // Configures transaction actions: mint, collect, attach policies, and send funds
    //             tx = tx
    //                 .mintAssets(policyID_toBurnValue, otcPolicyIdBurnRedeemerCloseHex)
    //                 .mintAssets(otcNFT_toBurnValue, otcNftBurnRedeemerHex)
    //                 .collectFrom([OTC_UTxO], otcPolicyIdBurnRedeemerCloseHex)
    //                 .attachSpendingValidator(otcScript)
    //                 .attachMintingPolicy(mintingOtcNFT)
    //                 .payToAddress(address, valueForGetBackToUser)
    //                 .addSigner(address);

    //             // Completes the transaction preparation
    //             const txComplete = await tx.complete();

    //             // Converts the transaction to CBOR Hex and computes the hash
    //             const txCborHex = txComplete.toString();
    //             const txHash = txComplete.toHash();
    //             console_log(0, this._Entity.className(), `Close Tx - txHash: ${showData(txHash)}`);

    //             // Creates transaction redeemer entities for record-keeping
    //             const transactionOTCValidatorRedeemerClose: TransactionRedeemer = {
    //                 tx_index: 0,
    //                 purpose: 'spend',
    //                 redeemerObj: OTCValidatorRedeemerClose,
    //             };

    //             // Creates transaction redeemer entities for record-keeping
    //             const transactionMarketNFTPolicyRedeemerBurnID: TransactionRedeemer = {
    //                 tx_index: 0,
    //                 purpose: 'mint',
    //                 redeemerObj: otcNftBurnRedeemer,
    //             };

    //             // Defines the input datum for the transaction
    //             const transactionOTCDatum_In: TransactionDatum = {
    //                 address: OTC_SmartUTxO.address,
    //                 datumType: OTCEntity.className(),
    //                 datumObj: OTC_SmartUTxO.datumObj,
    //             };

    //             // Creates and stores a new transaction entity in the backend
    //             const transaction: TransactionEntity = new TransactionEntity({
    //                 paymentPKH: walletTxParams.pkh,
    //                 date: new Date(now),
    //                 type: OTC_CLOSE,
    //                 hash: txHash,
    //                 status: TRANSACTION_STATUS_PENDING,
    //                 ids: {},
    //                 redeemers: {
    //                     marketNftPolicyRedeemerBurnID: transactionMarketNFTPolicyRedeemerBurnID,
    //                     OTCValidatorRedeemerClose: transactionOTCValidatorRedeemerClose,
    //                 },
    //                 datums: { OTCDatum_In: transactionOTCDatum_In },
    //                 consuming_UTxOs: [OTC_UTxO],
    //             });
    //             await TransactionBackEndApplied.create(transaction);

    //             // Logs the transaction CBOR Hex and returns it in the response
    //             console_log(-1, this._Entity.className(), `Close Tx - txCborHex: ${showData(txCborHex)}`);
    //             return res.status(200).json({ txCborHex, txHash });
    //         } catch (error) {
    //             // Logs any errors encountered and sends a 500 response with the error message
    //             console_error(-1, this._Entity.className(), `Close Tx - Error: ${error}`);
    //             return res.status(500).json({
    //                 error: `An error occurred while creating the ${this._Entity.apiRoute()} Close Tx: ${error}`,
    //             });
    //         }
    //     } else {
    //         // Handles unsupported HTTP methods with a 405 response
    //         console_error(-1, this._Entity.className(), `Close Tx - Error: Method not allowed`);
    //         return res.status(405).json({ error: `Method not allowed` });
    //     }
    // }

    // public static async cancelTxApiHandler(req: NextApiRequestAuthenticated, res: NextApiResponse) {
    //     // Checks if the HTTP method is POST to handle the Cancelal transaction
    //     if (req.method === 'POST') {
    //         console_log(1, this._Entity.className(), `Cancel Tx - POST - Init`);

    //         try {
    //             // Sanitizes the incoming request body to prevent potential database-related security issues
    //             const sanitizedBody = sanitizeForDatabase(req.body);

    //             // Destructures `walletTxParams` and `txParams` from the sanitized request body
    //             const {
    //                 walletTxParams,
    //                 txParams,
    //             }: {
    //                 walletTxParams: WalletTxParams;
    //                 txParams: CancelOTCTxParams;
    //             } = sanitizedBody;

    //             // Logs the transaction parameters for debugging
    //             console_log(0, this._Entity.className(), `Cancel Tx - txParams: ${showData(txParams)}`);

    //             // Ensures synchronization of the blockchain with server time if running in emulator mode
    //             if (isEmulator) {
    //                 // Uncomment this line to synchronize the emulator with server time
    //                 // await TimeBackEnd.syncBlockChainWithServerTime()
    //             }

    //             // Prepares the Lucid instance for transaction processing
    //             const { lucid } = await LucidToolsBackEnd.prepareLucidBackEndForTx(walletTxParams);

    //             // Extracts UTxOs and address from wallet transaction parameters
    //             const { utxos: uTxOsAtWallet, address } = walletTxParams;

    //             // Extracts specific parameters required for processing the transaction
    //             const { otcDbId, otcScript, mintingOtcNFT } = txParams;

    //             // Retrieves the OTC associated with the transaction based on the provided ID
    //             const Otc = await OTCBackEndApplied.getById_<OTCEntity>(otcDbId, {
    //                 ...optionsGetMinimalWithSmartUTxOCompleteFields,
    //             });

    //             // Throws an error if the OTC is not found
    //             if (Otc === undefined) {
    //                 throw `Invalid OTC id`;
    //             }

    //             // Checks that the OTC has an associated smart UTxO and is available for consumption
    //             const OTC_SmartUTxO = Otc.smartUTxO;
    //             if (OTC_SmartUTxO === undefined) {
    //                 throw `Can't find OTC UTxO`;
    //             }
    //             if (OTC_SmartUTxO.unsafeIsAvailableForConsuming() === false) {
    //                 throw `OTC UTxO is being used, please wait and try again`;
    //             }

    //             const policyID_AC = Otc.od_token_policy_id + strToHex(OTC_ID_TN);
    //             const policyID_toBurnValue: Assets = { [policyID_AC]: -1n };

    //             const otcNFT_AC = Otc.od_otc_nft_policy_id + strToHex(Otc.od_otc_nft_tn);
    //             const otcNFT_toBurnValue: Assets = { [otcNFT_AC]: -1n };

    //             const mayzAC = mayzPolicyId + strToHex(mayzTn);
    //             const mayzValue: Assets = { [mayzAC]: mayzLockAmount };

    //             // Add additional values to the transaction, including minimum ADA requirement
    //             let valueForGetBackToUser = mayzValue;

    //             const minAdaValue: Assets = {
    //                 lovelace: Otc.od_min_ada,
    //             };
    //             valueForGetBackToUser = addAssetsList([minAdaValue, valueForGetBackToUser]);

    //             // Gets the UTxO associated with the OTC
    //             const OTC_UTxO = OTC_SmartUTxO.getUTxO();

    //             // Create minting policy and redeemers for the sale transaction
    //             const otcNftBurnRedeemer = new BurnNFT();
    //             const otcNftBurnRedeemerHex = objToCborHex(otcNftBurnRedeemer);

    //             // Create minting policy and redeemers for the sale transaction
    //             const OTCValidatorRedeemerCancel = new CancelOTC();
    //             const otcPolicyIdBurnRedeemerCancelHex = objToCborHex(OTCValidatorRedeemerCancel);

    //             // Sets the transaction time range and logs it
    //             const { now, from, until } = await TimeBackEnd.getTxTimeRange();
    //             console_log(0, this._Entity.className(), `Cancel Tx - from ${from} to ${until}`);

    //             // Initializes a new Lucid transaction object
    //             let tx: Tx = lucid.newTx();

    //             // Configures transaction actions: mint, collect, attach policies, and send funds
    //             tx = tx
    //                 .mintAssets(policyID_toBurnValue, otcPolicyIdBurnRedeemerCancelHex)
    //                 .mintAssets(otcNFT_toBurnValue, otcNftBurnRedeemerHex)
    //                 .collectFrom([OTC_UTxO], otcPolicyIdBurnRedeemerCancelHex)
    //                 .attachSpendingValidator(otcScript)
    //                 .attachMintingPolicy(mintingOtcNFT)
    //                 .payToAddress(address, valueForGetBackToUser)
    //                 .addSigner(address);

    //             // Completes the transaction preparation
    //             const txComplete = await tx.complete();

    //             // Converts the transaction to CBOR Hex and computes the hash
    //             const txCborHex = txComplete.toString();
    //             const txHash = txComplete.toHash();
    //             console_log(0, this._Entity.className(), `Cancel Tx - txHash: ${showData(txHash)}`);

    //             // Creates transaction redeemer entities for record-keeping
    //             const transactionOTCValidatorRedeemerCancel: TransactionRedeemer = {
    //                 tx_index: 0,
    //                 purpose: 'spend',
    //                 redeemerObj: OTCValidatorRedeemerCancel,
    //             };

    //             // Creates transaction redeemer entities for record-keeping
    //             const transactionMarketNFTPolicyRedeemerBurnID: TransactionRedeemer = {
    //                 tx_index: 0,
    //                 purpose: 'mint',
    //                 redeemerObj: otcNftBurnRedeemer,
    //             };

    //             // Defines the input datum for the transaction
    //             const transactionOTCDatum_In: TransactionDatum = {
    //                 address: OTC_SmartUTxO.address,
    //                 datumType: OTCEntity.className(),
    //                 datumObj: OTC_SmartUTxO.datumObj,
    //             };

    //             // Creates and stores a new transaction entity in the backend
    //             const transaction: TransactionEntity = new TransactionEntity({
    //                 paymentPKH: walletTxParams.pkh,
    //                 date: new Date(now),
    //                 type: OTC_CANCEL,
    //                 hash: txHash,
    //                 status: TRANSACTION_STATUS_PENDING,
    //                 ids: {},
    //                 redeemers: {
    //                     marketNftPolicyRedeemerBurnID: transactionMarketNFTPolicyRedeemerBurnID,
    //                     OTCValidatorRedeemerCancel: transactionOTCValidatorRedeemerCancel,
    //                 },
    //                 datums: { OTCDatum_In: transactionOTCDatum_In },
    //                 consuming_UTxOs: [OTC_UTxO],
    //             });
    //             await TransactionBackEndApplied.create(transaction);

    //             // Logs the transaction CBOR Hex and returns it in the response
    //             console_log(-1, this._Entity.className(), `Cancel Tx - txCborHex: ${showData(txCborHex)}`);
    //             return res.status(200).json({ txCborHex, txHash });
    //         } catch (error) {
    //             // Logs any errors encountered and sends a 500 response with the error message
    //             console_error(-1, this._Entity.className(), `Cancel Tx - Error: ${error}`);
    //             return res.status(500).json({
    //                 error: `An error occurred while creating the ${this._Entity.apiRoute()} Cancel Tx: ${error}`,
    //             });
    //         }
    //     } else {
    //         // Handles unsupported HTTP methods with a 405 response
    //         console_error(-1, this._Entity.className(), `Cancel Tx - Error: Method not allowed`);
    //         return res.status(405).json({ error: `Method not allowed` });
    //     }
    // }

    // #endregion custom api handlers
}
