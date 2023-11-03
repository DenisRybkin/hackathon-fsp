import { Nullable } from '../../../types/app.types';
import { Account } from './entities/account.entity';

export abstract class AccountRepository {
  public abstract findById(id: BigInt): Promise<Nullable<Account>>;
  public abstract save(account: Account): Promise<void>;
}

