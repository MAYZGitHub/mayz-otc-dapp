import debounce from 'lodash/debounce';
import { useCallback, useContext, useMemo, useState } from 'react';
import { OTCEntityWithMetadata } from '../useHome';
import {
    BaseSmartDBFrontEndBtnHandlers,
    hexToStr,
    Token_With_Metadata_And_Amount,
    useWalletStore,
} from 'smart-db';
import { OTCApi } from '@/lib/SmartDB/FrontEnd';
import { OTCEntity } from '@/lib/SmartDB/Entities';
import { AppStateContext } from '@/contexts/AppState';
import { ClaimOTCTxParams } from '@/utils/constants/on-chain';

interface TokenCardInterface {
    tokens: Token_With_Metadata_And_Amount;
    btnHandler: () => void;
}

export interface UseClaimProps {
    listOfOtcEntityWithTokens: OTCEntityWithMetadata[];
    walletTokens: Token_With_Metadata_And_Amount[] | undefined;
}

export const useClaim = ({ listOfOtcEntityWithTokens, walletTokens }: UseClaimProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tokenCardInterfaces, setTokenCardInterfaces] = useState<TokenCardInterface[]>([]);

    const debouncedSetSearchTerm = useCallback(
        debounce((value: string) => setSearchTerm(value), 100),
        []
    );

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSetSearchTerm(event.target.value);
    };

    const cancelBtnHandler = async (id: string) => {
      //   try {
      //       const txParams: ClaimOTCTxParams = {
      //           otcDbId: id,
      //           otcSmartContractAddress: '', // Agrega params reales aquí
      //           otcScript: '',                // Agrega params reales aquí
      //       };

      //       const result = await BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransaction_V1(
      //           OTCEntity,
      //           'Claiming OTC...',
      //           'Claim Tx',
      //           console.log,
      //           console.log,
      //           walletStore,
      //           txParams,
      //           OTCApi.callGenericTxApi_.bind(OTCApi, 'claim-tx')
      //       );

      //       if (result === false) throw new Error('Transaction failed');

      //   } catch (e) {
      //       console.error(e);
      //   }
    };

    const mapTokenToInterface = useCallback((token: OTCEntityWithMetadata): TokenCardInterface => ({
        tokens: token.metadata,
        btnHandler: () => cancelBtnHandler(token.entity._DB_id),
    }), []);

    useMemo(() => {
        if (!walletTokens || walletTokens.length === 0) {
            setTokenCardInterfaces([]);
            return;
        }

        const filtered = listOfOtcEntityWithTokens.filter((otcEntity) =>
            walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id)
        );

        setTokenCardInterfaces(filtered.map(mapTokenToInterface));
    }, [listOfOtcEntityWithTokens, walletTokens, mapTokenToInterface]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return tokenCardInterfaces;

        const lowerSearchTerm = searchTerm.toLowerCase();
        return tokenCardInterfaces.filter((item) =>
            hexToStr(item.tokens.TN_Hex).toLowerCase().includes(lowerSearchTerm) ||
            item.tokens.CS.toLowerCase().includes(lowerSearchTerm)
        );
    }, [searchTerm, tokenCardInterfaces]);

    return {
        searchTerm,
        handleInputChange,
        filteredItems,
    };
};
