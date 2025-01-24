import {
    BackEndApiHandlersFor,
    BackEndAppliedFor,
    BaseBackEndApiHandlers,
    BaseBackEndApplied,
    BaseBackEndMethods,
} from 'smart-db/backEnd';
import { LocalProtocolAdminEntity } from '../Entities/LocalProtocolAdmin.Entity';

@BackEndAppliedFor(LocalProtocolAdminEntity)
export class LocalProtocolAdminBackEndApplied extends BaseBackEndApplied   {
    protected static _Entity = LocalProtocolAdminEntity;
    protected static _BackEndMethods = BaseBackEndMethods ;
}

@BackEndApiHandlersFor(LocalProtocolAdminEntity)
export class LocalProtocolAdminApiHandlers extends BaseBackEndApiHandlers    {
    protected static _Entity = LocalProtocolAdminEntity;
    protected static _BackEndApplied = LocalProtocolAdminBackEndApplied;

}

