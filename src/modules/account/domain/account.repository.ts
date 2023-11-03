import { Nullable } from '../../../types/app.types';
import { Account } from './entities/account.entity';

export abstract class IAccountRepository {
  public abstract findById(id: bigint): Promise<Nullable<Account>>;
  public abstract save(account: Account): Promise<void>;
}

