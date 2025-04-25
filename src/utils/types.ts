import { ReactNode } from 'react';
import { Token_With_Metadata_And_Amount } from 'smart-db';

export interface TokensInterface {
    token: Token_With_Metadata_And_Amount;
    btnHandler: ReactNode;
}
